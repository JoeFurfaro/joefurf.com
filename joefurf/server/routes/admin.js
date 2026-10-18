import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { isAdmin, login, logout, requireAdmin } from "../auth.js";
import { db } from "../db.js";
import { notifyShipped } from "../notifications.js";
import { adminListing } from "../shop.js";
import { deleteObject, putObject } from "../storage.js";
import { now, slugify } from "../util.js";

export const adminRoutes = new Hono();

adminRoutes.post("/login", login);
adminRoutes.post("/logout", logout);
adminRoutes.get("/me", async (c) => c.json({ admin: await isAdmin(c) }));

adminRoutes.use("*", requireAdmin);

const getListing = (id) => db.query("SELECT * FROM listings WHERE id = ?").get(id);
const getOrder = (id) => db.query("SELECT * FROM orders WHERE id = ?").get(id);

function cents(value, field, { nullable = false } = {}) {
  if (value === null && nullable) return null;
  if (!Number.isInteger(value) || value < 0 || value > 10_000_000) throw new HttpError(`${field} must be a whole number of cents`);
  return value;
}

class HttpError extends Error {}

adminRoutes.onError((err, c) => {
  if (err instanceof HttpError) return c.json({ error: err.message }, 400);
  console.error("[admin]", err);
  return c.json({ error: "Something went wrong" }, 500);
});

// ---- Listings ----

adminRoutes.get("/listings", (c) => {
  const rows = db.query("SELECT * FROM listings ORDER BY created_at DESC").all();
  return c.json(rows.map(adminListing));
});

adminRoutes.post("/listings", async (c) => {
  const body = await c.req.json();
  const title = String(body.title ?? "").trim();
  if (!title) throw new HttpError("Title is required");
  const listing = db.transaction(() => {
    const row = db
      .query("INSERT INTO listings (slug, title, price_cents) VALUES (?, ?, ?) RETURNING *")
      .get(crypto.randomUUID(), title, cents(body.price_cents ?? 0, "Price"));
    return db.query("UPDATE listings SET slug = ? WHERE id = ? RETURNING *").get(`${slugify(title)}-${row.id}`, row.id);
  })();
  return c.json(adminListing(listing), 201);
});

adminRoutes.get("/listings/:id", (c) => {
  const listing = getListing(c.req.param("id"));
  return listing ? c.json(adminListing(listing)) : c.json({ error: "Not found" }, 404);
});

adminRoutes.patch("/listings/:id", async (c) => {
  const listing = getListing(c.req.param("id"));
  if (!listing) return c.json({ error: "Not found" }, 404);
  const body = await c.req.json();
  const next = { ...listing };

  if ("title" in body) {
    next.title = String(body.title).trim();
    if (!next.title) throw new HttpError("Title is required");
    // Keep URLs stable once a board has been published.
    if (listing.status === "draft" && !listing.published_at) next.slug = `${slugify(next.title)}-${listing.id}`;
  }
  if ("description" in body) next.description = String(body.description);
  if ("details" in body) next.details = String(body.details);
  if ("price_cents" in body) next.price_cents = cents(body.price_cents, "Price");
  if ("shipping_cents" in body) next.shipping_cents = cents(body.shipping_cents, "Shipping", { nullable: true });
  if ("pickup_available" in body) next.pickup_available = body.pickup_available ? 1 : 0;

  if ("status" in body && body.status !== listing.status) {
    if (!["draft", "available", "sold"].includes(body.status)) throw new HttpError("Invalid status");
    next.status = body.status;
    if (body.status === "available") {
      next.published_at ??= now();
      next.sold_at = null;
    }
    if (body.status === "sold") next.sold_at = now();
  }

  if (next.status === "available") {
    if (next.price_cents <= 0) throw new HttpError("Set a price before publishing");
    if (next.shipping_cents === null && !next.pickup_available) throw new HttpError("Enable shipping or pickup before publishing");
    const photoCount = db.query("SELECT COUNT(*) AS n FROM photos WHERE listing_id = ?").get(listing.id).n;
    if (photoCount === 0) throw new HttpError("Add at least one photo before publishing");
  }

  const updated = db
    .query(
      `UPDATE listings SET slug = $slug, title = $title, description = $description, details = $details,
         price_cents = $price_cents, shipping_cents = $shipping_cents, pickup_available = $pickup_available,
         status = $status, published_at = $published_at, sold_at = $sold_at
       WHERE id = $id RETURNING *`,
    )
    .get({
      slug: next.slug,
      title: next.title,
      description: next.description,
      details: next.details,
      price_cents: next.price_cents,
      shipping_cents: next.shipping_cents,
      pickup_available: next.pickup_available,
      status: next.status,
      published_at: next.published_at,
      sold_at: next.sold_at,
      id: listing.id,
    });
  return c.json(adminListing(updated));
});

adminRoutes.delete("/listings/:id", async (c) => {
  const listing = getListing(c.req.param("id"));
  if (!listing) return c.json({ error: "Not found" }, 404);
  if (db.query("SELECT 1 FROM orders WHERE listing_id = ?").get(listing.id)) {
    throw new HttpError("This board has orders, so it can't be deleted. Set it back to draft instead.");
  }
  const photos = db.query("SELECT key, thumb_key FROM photos WHERE listing_id = ?").all(listing.id);
  db.query("DELETE FROM listings WHERE id = ?").run(listing.id);
  await Promise.all(photos.flatMap((p) => [deleteObject(p.key), deleteObject(p.thumb_key)]));
  return c.json({ ok: true });
});

// ---- Photos ----
// The browser resizes and re-encodes photos before upload (which also strips EXIF/GPS data),
// so the server only stores what it receives.

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

// Detect the format from the file's bytes; the multipart content type can't be trusted.
async function imageKind(file) {
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_IMAGE_BYTES) return null;
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  const ascii = (from, to) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  return null;
}

adminRoutes.post("/listings/:id/photos", bodyLimit({ maxSize: 20 * 1024 * 1024 }), async (c) => {
  const listing = getListing(c.req.param("id"));
  if (!listing) return c.json({ error: "Not found" }, 404);

  const form = await c.req.formData();
  const full = form.get("full");
  const thumb = form.get("thumb");
  const [fullKind, thumbKind] = await Promise.all([imageKind(full), imageKind(thumb)]);
  if (!fullKind || !thumbKind) throw new HttpError("Photos must be JPEG or WebP and under 8 MB");

  const id = crypto.randomUUID();
  const key = `listings/${listing.id}/${id}.${fullKind.ext}`;
  const thumbKey = `listings/${listing.id}/${id}-thumb.${thumbKind.ext}`;
  await Promise.all([putObject(key, full, fullKind.type), putObject(thumbKey, thumb, thumbKind.type)]);

  const position = db.query("SELECT COALESCE(MAX(position), -1) + 1 AS p FROM photos WHERE listing_id = ?").get(listing.id).p;
  db.query("INSERT INTO photos (listing_id, key, thumb_key, width, height, position) VALUES (?, ?, ?, ?, ?, ?)").run(
    listing.id,
    key,
    thumbKey,
    Number(form.get("width")) || null,
    Number(form.get("height")) || null,
    position,
  );
  return c.json(adminListing(getListing(listing.id)), 201);
});

adminRoutes.put("/listings/:id/photos/order", async (c) => {
  const listing = getListing(c.req.param("id"));
  if (!listing) return c.json({ error: "Not found" }, 404);
  const { ids } = await c.req.json();
  if (!Array.isArray(ids)) throw new HttpError("ids must be an array");
  const update = db.query("UPDATE photos SET position = ? WHERE id = ? AND listing_id = ?");
  db.transaction(() => ids.forEach((id, i) => update.run(i, id, listing.id)))();
  return c.json(adminListing(listing));
});

adminRoutes.delete("/photos/:id", async (c) => {
  const photo = db.query("SELECT * FROM photos WHERE id = ?").get(c.req.param("id"));
  if (!photo) return c.json({ error: "Not found" }, 404);
  const listing = getListing(photo.listing_id);
  const remaining = db.query("SELECT COUNT(*) AS n FROM photos WHERE listing_id = ?").get(listing.id).n;
  if (listing.status === "available" && remaining <= 1) throw new HttpError("A published board needs at least one photo");
  db.query("DELETE FROM photos WHERE id = ?").run(photo.id);
  await Promise.all([deleteObject(photo.key), deleteObject(photo.thumb_key)]);
  return c.json(adminListing(listing));
});

// ---- Orders ----

const ORDER_SELECT = `SELECT o.*, l.title AS listing_title, l.slug AS listing_slug FROM orders o JOIN listings l ON l.id = o.listing_id`;

adminRoutes.get("/orders", (c) => {
  const open = c.req.query("filter") !== "all";
  const rows = db
    .query(`${ORDER_SELECT} ${open ? "WHERE o.status = 'paid'" : ""} ORDER BY o.created_at DESC LIMIT 500`)
    .all();
  return c.json(rows);
});

adminRoutes.get("/orders/:id", (c) => {
  const order = db.query(`${ORDER_SELECT} WHERE o.id = ?`).get(c.req.param("id"));
  return order ? c.json(order) : c.json({ error: "Not found" }, 404);
});

const ORDER_STATUSES = ["paid", "shipped", "delivered", "picked_up", "refunded"];

adminRoutes.patch("/orders/:id", async (c) => {
  const order = getOrder(c.req.param("id"));
  if (!order) return c.json({ error: "Not found" }, 404);
  const body = await c.req.json();
  const next = { ...order };

  if ("notes" in body) next.notes = String(body.notes);
  if ("tracking_number" in body) next.tracking_number = body.tracking_number ? String(body.tracking_number).trim() : null;
  if ("tracking_url" in body) {
    const url = body.tracking_url ? String(body.tracking_url).trim() : null;
    if (url && !/^https:\/\//.test(url)) throw new HttpError("Tracking link must start with https://");
    next.tracking_url = url;
  }
  const becameShipped = body.status === "shipped" && order.status !== "shipped";
  if ("status" in body && body.status !== order.status) {
    if (!ORDER_STATUSES.includes(body.status)) throw new HttpError("Invalid status");
    next.status = body.status;
    if (body.status === "shipped") next.shipped_at ??= now();
    if (["delivered", "picked_up"].includes(body.status)) next.completed_at = now();
  }

  db.query(
    `UPDATE orders SET status = ?, tracking_number = ?, tracking_url = ?, notes = ?, shipped_at = ?, completed_at = ? WHERE id = ?`,
  ).run(next.status, next.tracking_number, next.tracking_url, next.notes, next.shipped_at, next.completed_at, order.id);

  if (becameShipped && body.notify_customer !== false) {
    await notifyShipped(next, getListing(order.listing_id));
  }
  return c.json(db.query(`${ORDER_SELECT} WHERE o.id = ?`).get(order.id));
});
