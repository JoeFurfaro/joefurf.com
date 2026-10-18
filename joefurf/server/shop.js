import { db } from "./db.js";
import { now } from "./util.js";

// A listing is reserved while a buyer has an open Checkout Session for it.
export function isReserved(listing) {
  return Boolean(listing.reserved_session_id && listing.reserved_until > now());
}

export function photosFor(listingId) {
  return db
    .query("SELECT id, key, thumb_key, width, height, position FROM photos WHERE listing_id = ? ORDER BY position, id")
    .all(listingId)
    .map((p) => ({
      id: p.id,
      url: `/media/${p.key}`,
      thumbUrl: `/media/${p.thumb_key}`,
      width: p.width,
      height: p.height,
    }));
}

export function publicListing(listing, { withPhotos = true } = {}) {
  const photos = photosFor(listing.id);
  return {
    slug: listing.slug,
    title: listing.title,
    description: listing.description,
    details: listing.details,
    priceCents: listing.price_cents,
    shippingCents: listing.shipping_cents,
    pickupAvailable: Boolean(listing.pickup_available),
    status: listing.status === "available" && isReserved(listing) ? "reserved" : listing.status,
    soldAt: listing.sold_at,
    publishedAt: listing.published_at,
    cover: photos[0] ?? null,
    ...(withPhotos ? { photos } : {}),
  };
}

export function adminListing(listing) {
  return {
    ...listing,
    pickup_available: Boolean(listing.pickup_available),
    reserved: isReserved(listing),
    photos: photosFor(listing.id),
    order_id: db.query("SELECT id FROM orders WHERE listing_id = ? ORDER BY id DESC LIMIT 1").get(listing.id)?.id ?? null,
  };
}

// Atomically claims a listing for a checkout. Returns false if it isn't purchasable.
// `token` stands in for the session id until Stripe returns one.
export function reserveListing(listingId, token, until) {
  const result = db
    .query(
      `UPDATE listings SET reserved_session_id = ?, reservation_token = ?, reserved_until = ?
       WHERE id = ? AND status = 'available' AND (reserved_session_id IS NULL OR reserved_until <= ?)`,
    )
    .run(token, token, until, listingId, now());
  return result.changes === 1;
}

export function attachSessionToReservation(token, sessionId) {
  db.query("UPDATE listings SET reserved_session_id = ? WHERE reservation_token = ?").run(sessionId, token);
}

// Delayed payment methods (e.g. bank debits) complete checkout before the money clears.
export function extendReservation(sessionId, until) {
  db.query("UPDATE listings SET reserved_until = ? WHERE reserved_session_id = ? AND status = 'available'").run(until, sessionId);
}

export function releaseReservation({ sessionId, token }) {
  db.query(
    `UPDATE listings SET reserved_session_id = NULL, reservation_token = NULL, reserved_until = NULL
     WHERE status = 'available' AND (reserved_session_id = ? OR reservation_token = ?)`,
  ).run(sessionId ?? null, token ?? null);
}

function formatAddress(address) {
  if (!address) return null;
  return [address.line1, address.line2, `${address.city ?? ""}, ${address.state ?? ""} ${address.postal_code ?? ""}`.trim(), address.country]
    .filter(Boolean)
    .join("\n");
}

// Records a paid Checkout Session as an order. Idempotent: returns { order, created }.
export function recordPaidSession(session) {
  const existing = db.query("SELECT * FROM orders WHERE stripe_session_id = ?").get(session.id);
  if (existing) return { order: existing, created: false };

  const listingId = Number(session.metadata?.listing_id);
  const listing = db.query("SELECT * FROM listings WHERE id = ?").get(listingId);
  if (!listing) throw new Error(`Checkout session ${session.id} references unknown listing ${session.metadata?.listing_id}`);

  const shipping = session.collected_information?.shipping_details ?? session.shipping_details ?? null;
  const customer = session.customer_details ?? {};
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  let order;
  db.transaction(() => {
    order = db
      .query(
        `INSERT INTO orders (listing_id, stripe_session_id, stripe_payment_intent_id, fulfillment, amount_total,
           amount_shipping, amount_tax, currency, customer_name, customer_email, customer_phone, shipping_name, shipping_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      )
      .get(
        listing.id,
        session.id,
        paymentIntent ?? null,
        session.metadata?.fulfillment === "pickup" ? "pickup" : "ship",
        session.amount_total ?? 0,
        session.total_details?.amount_shipping ?? session.shipping_cost?.amount_total ?? 0,
        session.total_details?.amount_tax ?? 0,
        session.currency ?? "cad",
        customer.name ?? null,
        customer.email ?? null,
        customer.phone ?? null,
        shipping?.name ?? null,
        formatAddress(shipping?.address),
      );
    db.query(
      "UPDATE listings SET status = 'sold', sold_at = ?, reserved_session_id = NULL, reservation_token = NULL, reserved_until = NULL WHERE id = ?",
    ).run(now(), listing.id);
  })();

  return { order, created: true, listing, doubleSold: listing.status === "sold" };
}
