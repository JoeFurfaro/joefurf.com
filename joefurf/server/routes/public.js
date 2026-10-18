import { Hono } from "hono";
import { config } from "../config.js";
import { db } from "../db.js";
import { notifyNewOrder } from "../notifications.js";
import {
  attachSessionToReservation,
  publicListing,
  recordPaidSession,
  releaseReservation,
  reserveListing,
} from "../shop.js";
import { stripe } from "../stripe.js";
import { clientIp, now, rateLimiter } from "../util.js";

export const publicRoutes = new Hono();

const checkoutLimiter = rateLimiter({ limit: 10, windowSeconds: 60 * 60 });

// Stripe requires Checkout Sessions to live at least 30 minutes.
const CHECKOUT_SECONDS = 31 * 60;

publicRoutes.get("/listings", (c) => {
  const rows = db
    .query(
      `SELECT * FROM listings WHERE status IN ('available', 'sold')
       ORDER BY status = 'sold', COALESCE(sold_at, published_at, created_at) DESC`,
    )
    .all();
  return c.json(rows.map((l) => publicListing(l, { withPhotos: false })));
});

publicRoutes.get("/listings/:slug", (c) => {
  const listing = db.query("SELECT * FROM listings WHERE slug = ? AND status != 'draft'").get(c.req.param("slug"));
  if (!listing) return c.json({ error: "Not found" }, 404);
  return c.json(publicListing(listing));
});

publicRoutes.post("/checkout", async (c) => {
  if (!stripe) return c.json({ error: "Checkout isn't set up yet." }, 503);
  if (!checkoutLimiter(clientIp(c))) return c.json({ error: "Too many checkout attempts. Try again later." }, 429);

  const { slug, fulfillment } = await c.req.json().catch(() => ({}));
  const listing = db.query("SELECT * FROM listings WHERE slug = ? AND status = 'available'").get(slug ?? "");
  if (!listing) return c.json({ error: "This piece isn't available anymore." }, 409);

  const shipping = fulfillment === "ship" && listing.shipping_cents !== null;
  const pickup = fulfillment === "pickup" && listing.pickup_available;
  if (!shipping && !pickup) return c.json({ error: "Pick shipping or local pickup." }, 400);

  const token = crypto.randomUUID();
  const expiresAt = now() + CHECKOUT_SECONDS;
  // Hold slightly past Stripe's expiry so a last-second payment can't race a new buyer.
  if (!reserveListing(listing.id, token, expiresAt + 120)) {
    return c.json({ error: "Someone is checking out with this piece right now. Try again in about 30 minutes." }, 409);
  }

  const taxBehavior = config.stripeTaxEnabled ? { tax_behavior: "exclusive" } : {};
  const cover = db.query("SELECT key FROM photos WHERE listing_id = ? ORDER BY position, id LIMIT 1").get(listing.id);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      expires_at: expiresAt,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: config.currency,
            unit_amount: listing.price_cents,
            ...taxBehavior,
            product_data: {
              name: listing.title,
              ...(listing.description ? { description: listing.description.slice(0, 500) } : {}),
              ...(cover && config.publicUrl.startsWith("https://") ? { images: [`${config.publicUrl}/media/${cover.key}`] } : {}),
            },
          },
        },
      ],
      ...(shipping
        ? {
            shipping_address_collection: { allowed_countries: config.shippingCountries },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  display_name: "Shipping",
                  fixed_amount: { amount: listing.shipping_cents, currency: config.currency },
                  ...taxBehavior,
                },
              },
            ],
          }
        : {}),
      ...(config.stripeTaxEnabled ? { automatic_tax: { enabled: true }, billing_address_collection: "required" } : {}),
      phone_number_collection: { enabled: true },
      ...(pickup ? { custom_text: { submit: { message: "Local pickup in Toronto. I'll email you to set up a time." } } } : {}),
      metadata: { listing_id: String(listing.id), fulfillment: pickup ? "pickup" : "ship", reservation: token },
      payment_intent_data: { metadata: { listing_id: String(listing.id) } },
      success_url: `${config.publicUrl}/shop/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.publicUrl}/shop/${listing.slug}?cancelled=${token}`,
    });
    attachSessionToReservation(token, session.id);
    return c.json({ url: session.url });
  } catch (err) {
    releaseReservation({ token });
    console.error("[checkout] failed to create session:", err);
    return c.json({ error: "Couldn't start checkout. Please try again." }, 502);
  }
});

// Called when a buyer backs out of Stripe Checkout, so the board is buyable again right away.
publicRoutes.post("/checkout/cancel", async (c) => {
  const { token } = await c.req.json().catch(() => ({}));
  if (typeof token !== "string") return c.json({ ok: true });
  const listing = db.query("SELECT reserved_session_id FROM listings WHERE reservation_token = ?").get(token);
  if (listing?.reserved_session_id?.startsWith("cs_") && stripe) {
    try {
      await stripe.checkout.sessions.expire(listing.reserved_session_id);
    } catch (err) {
      // Already completed or expired; the webhook decides what happens.
      console.warn("[checkout] could not expire session:", err.message);
      return c.json({ ok: true });
    }
  }
  releaseReservation({ token });
  return c.json({ ok: true });
});

// Powers the thank-you page. Also records the order if the webhook hasn't arrived yet.
publicRoutes.get("/checkout/session/:id", async (c) => {
  if (!stripe) return c.json({ error: "Not configured" }, 503);
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(c.req.param("id"));
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
  if (session.payment_status !== "paid") return c.json({ paid: false });

  const order = await handlePaidSession(session);
  const listing = db.query("SELECT * FROM listings WHERE id = ?").get(order.listing_id);
  return c.json({
    paid: true,
    title: listing.title,
    slug: listing.slug,
    fulfillment: order.fulfillment,
    email: order.customer_email,
    amountTotal: order.amount_total,
  });
});

export async function handlePaidSession(session) {
  const result = recordPaidSession(session);
  if (result.created) {
    notifyNewOrder(result.order, result.listing, { doubleSold: result.doubleSold }).catch((err) =>
      console.error("[order] notification failed:", err),
    );
  }
  return result.order;
}
