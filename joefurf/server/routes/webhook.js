import { Hono } from "hono";
import { config } from "../config.js";
import { db } from "../db.js";
import { extendReservation, releaseReservation } from "../shop.js";
import { now } from "../util.js";
import { stripe } from "../stripe.js";
import { handlePaidSession } from "./public.js";

export const webhookRoutes = new Hono();

webhookRoutes.post("/", async (c) => {
  if (!stripe || !config.stripeWebhookSecret) return c.text("Not configured", 503);

  const body = await c.req.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, c.req.header("stripe-signature") ?? "", config.stripeWebhookSecret);
  } catch (err) {
    console.warn("[webhook] bad signature:", err.message);
    return c.text("Bad signature", 400);
  }

  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      if (obj.payment_status === "paid") await handlePaidSession(obj);
      // Paid by a delayed method: hold the board until async_payment_succeeded/failed arrives.
      else extendReservation(obj.id, now() + 14 * 24 * 60 * 60);
      break;
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      releaseReservation({ sessionId: obj.id });
      break;
    case "charge.refunded":
      if (obj.refunded && obj.payment_intent) {
        db.query("UPDATE orders SET status = 'refunded' WHERE stripe_payment_intent_id = ?").run(obj.payment_intent);
      }
      break;
  }
  return c.json({ received: true });
});
