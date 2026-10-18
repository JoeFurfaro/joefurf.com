import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, ErrorText, Field, Input, Loading, TextArea } from "../components/ui";
import { api, useApi } from "../lib/api";
import { formatDate, formatMoney } from "../lib/money";
import { ORDER_STATUS_LABELS } from "../lib/orders";

export const Route = createFileRoute("/admin/orders/$id")({
  component: RouteComponent,
});

const Row = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:gap-4">
    <span className="sm:w-32 shrink-0 text-sm text-text-secondary">{label}</span>
    <span className="text-text-main whitespace-pre-line">{children}</span>
  </div>
);

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}
      className="text-sm text-hyperlink hover:underline cursor-pointer self-start"
    >
      {copied ? "copied ✓" : "copy address"}
    </button>
  );
};

const Fulfil = ({ order, onChange }) => {
  const [tracking, setTracking] = useState({ tracking_number: order.tracking_number ?? "", tracking_url: order.tracking_url ?? "" });
  const [notes, setNotes] = useState(order.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const update = async (body) => {
    setSaving(true);
    setError(null);
    try {
      onChange(await api(`/admin/orders/${order.id}`, { method: "PATCH", body }));
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const isShip = order.fulfillment === "ship";

  return (
    <div className="flex flex-col gap-4">
      {isShip && (
        <>
          <h2 className="text-lg text-text-main font-medium">Shipping</h2>
          <Field label="Tracking number">
            <Input value={tracking.tracking_number} onChange={(e) => setTracking({ ...tracking, tracking_number: e.target.value })} />
          </Field>
          <Field label="Tracking link" hint="Paste the carrier's tracking page link. It's included in the email to the buyer.">
            <Input
              type="url"
              value={tracking.tracking_url}
              onChange={(e) => setTracking({ ...tracking, tracking_url: e.target.value })}
              placeholder="https://"
            />
          </Field>
        </>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        {order.status === "paid" && isShip && (
          <Button variant="primary" disabled={saving} onClick={() => update({ ...tracking, status: "shipped" })}>
            Mark shipped & email buyer
          </Button>
        )}
        {order.status === "paid" && !isShip && (
          <Button variant="primary" disabled={saving} onClick={() => update({ status: "picked_up" })}>
            Mark picked up
          </Button>
        )}
        {order.status === "shipped" && (
          <Button variant="primary" disabled={saving} onClick={() => update({ status: "delivered" })}>
            Mark delivered
          </Button>
        )}
        {isShip && order.status !== "paid" && (
          <Button disabled={saving} onClick={() => update(tracking)}>
            Save tracking
          </Button>
        )}
      </div>
      <Field label="Private notes">
        <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Pickup Saturday 2pm" />
      </Field>
      <Button disabled={saving || notes === order.notes} onClick={() => update({ notes })} className="self-start">
        Save notes
      </Button>
      <ErrorText error={error} />
    </div>
  );
};

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: order, error, loading, setData } = useApi(`/admin/orders/${id}`);

  if (loading && !order) return <Loading />;
  if (error) return <ErrorText error={error} />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-text-main text-3xl">Order #{order.id}</h1>
          <Link to="/admin/listings/$id" params={{ id: String(order.listing_id) }} className="text-hyperlink hover:underline">
            {order.listing_title}
          </Link>
        </div>
        <Badge tone={order.status === "paid" ? "green" : "slate"}>{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>

      <div className="flex flex-col gap-3">
        <Row label="Ordered">{formatDate(order.created_at)}</Row>
        <Row label="Buyer">{order.customer_name}</Row>
        <Row label="Email">
          <a href={`mailto:${order.customer_email}`} className="text-hyperlink hover:underline">
            {order.customer_email}
          </a>
        </Row>
        {order.customer_phone && (
          <Row label="Phone">
            <a href={`tel:${order.customer_phone}`} className="text-hyperlink hover:underline">
              {order.customer_phone}
            </a>
          </Row>
        )}
        <Row label="Fulfillment">{order.fulfillment === "pickup" ? "Local pickup" : "Ship"}</Row>
        {order.fulfillment === "ship" && (
          <Row label="Ship to">
            <span className="flex flex-col">
              {`${order.shipping_name ?? ""}\n${order.shipping_address ?? ""}`}
              <CopyButton text={`${order.shipping_name ?? ""}\n${order.shipping_address ?? ""}`} />
            </span>
          </Row>
        )}
        <Row label="Paid">
          {formatMoney(order.amount_total)}
          <span className="text-text-secondary text-sm">
            {order.amount_shipping > 0 && ` (incl. ${formatMoney(order.amount_shipping)} shipping)`}
            {order.amount_tax > 0 && ` (incl. ${formatMoney(order.amount_tax)} tax)`}
          </span>
        </Row>
        {order.shipped_at && <Row label="Shipped">{formatDate(order.shipped_at)}</Row>}
        {order.stripe_payment_intent_id && (
          <Row label="Stripe">
            <a
              href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
              target="_blank"
              rel="noreferrer"
              className="text-hyperlink hover:underline"
            >
              view payment / refund →
            </a>
          </Row>
        )}
      </div>

      {order.status !== "refunded" && <Fulfil key={order.status} order={order} onChange={setData} />}
    </div>
  );
}
