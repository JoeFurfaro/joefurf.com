import { config } from "./config.js";
import { sendEmail } from "./email.js";
import { formatMoney } from "./util.js";

const pieceUrl = (listing) => `${config.publicUrl}/shop/${listing.slug}`;

export async function notifyNewOrder(order, listing, { doubleSold = false } = {}) {
  const money = (cents) => formatMoney(cents, order.currency);
  const lines = [
    doubleSold ? "⚠️ This piece was already marked sold before this payment came in. Check for a double sale and refund one buyer if needed.\n" : null,
    `${listing.title} just sold for ${money(order.amount_total)}.`,
    "",
    `Buyer: ${order.customer_name ?? "?"} <${order.customer_email ?? "?"}>${order.customer_phone ? `, ${order.customer_phone}` : ""}`,
    order.fulfillment === "pickup"
      ? "Fulfillment: LOCAL PICKUP. Reach out to arrange a time."
      : `Ship to:\n${order.shipping_name ?? ""}\n${order.shipping_address ?? ""}`,
    "",
    `Order: ${config.publicUrl}/admin/orders/${order.id}`,
  ].filter((l) => l !== null);

  await sendEmail({
    to: config.adminEmail,
    subject: `${doubleSold ? "⚠️ " : ""}Sold: ${listing.title} (${money(order.amount_total)})`,
    text: lines.join("\n"),
    // Hitting reply goes straight to the buyer.
    replyTo: order.customer_email ?? undefined,
  });

  const next =
    order.fulfillment === "pickup"
      ? "I'll reach out shortly to set up a pickup time in Toronto."
      : "I'll pack it up and send you a tracking number once it ships.";
  await sendEmail({
    to: order.customer_email,
    subject: `Thanks for your order: ${listing.title} (order #${order.id})`,
    text: [
      `Hi ${order.customer_name?.split(" ")[0] ?? "there"},`,
      "",
      `Thank you for buying "${listing.title}"! Your payment of ${money(order.amount_total)} went through.`,
      next,
      "",
      `Order #${order.id}`,
      `${listing.title}: ${money(order.amount_total - order.amount_shipping - order.amount_tax)}`,
      order.amount_shipping ? `Shipping: ${money(order.amount_shipping)}` : null,
      order.amount_tax ? `Tax: ${money(order.amount_tax)}` : null,
      `Total: ${money(order.amount_total)}`,
      order.fulfillment === "ship" && order.shipping_address ? `\nShipping to:\n${order.shipping_name ?? ""}\n${order.shipping_address}` : null,
      "",
      `See your piece: ${pieceUrl(listing)}`,
      "",
      "If you have any questions, just reply to this email.",
      "",
      "Joe",
    ]
      .filter((l) => l !== null)
      .join("\n"),
  });
}

export async function notifyShipped(order, listing) {
  const tracking = order.tracking_url || order.tracking_number;
  await sendEmail({
    to: order.customer_email,
    subject: `Your ${listing.title} has shipped (order #${order.id})`,
    text: [
      `Hi ${order.customer_name?.split(" ")[0] ?? "there"},`,
      "",
      `Your "${listing.title}" is on its way.`,
      tracking ? `Tracking: ${tracking}` : null,
      "",
      `Order #${order.id}: ${pieceUrl(listing)}`,
      "",
      "If you have any questions about caring for it, just reply to this email.",
      "",
      "Enjoy!",
      "Joe",
    ]
      .filter((l) => l !== null)
      .join("\n"),
  });
}
