import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Breadcrumb } from "antd";
import { useEffect, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { Badge, Button, ErrorText, Loading } from "../components/ui";
import { api, useApi } from "../lib/api";
import { formatMoney } from "../lib/money";

export const Route = createFileRoute("/shop/$slug")({
  component: RouteComponent,
  validateSearch: (search) => ({ cancelled: typeof search.cancelled === "string" ? search.cancelled : undefined }),
});

const Gallery = ({ photos, title }) => {
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? photos[0];
  if (!current) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-md border border-tag-border bg-tag-background">
        <img src={current.url} alt={title} className="w-full max-h-[70vh] object-contain" />
      </div>
      {photos.length > 1 && (
        <div className="flex flex-row gap-2 overflow-x-auto">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setIndex(i)}
              className={`shrink-0 h-16 w-16 overflow-hidden rounded border-2 cursor-pointer ${i === index ? "border-text-main" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <img src={p.thumbUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FulfillmentOption = ({ checked, onChange, label, sublabel }) => (
  <label
    className={`flex flex-row items-center justify-between gap-3 px-4 py-3 rounded-md border cursor-pointer ${checked ? "border-text-main" : "border-tag-border"}`}
  >
    <span className="flex flex-row items-center gap-3">
      <input type="radio" checked={checked} onChange={onChange} className="accent-text-main" />
      <span className="text-text-main">{label}</span>
    </span>
    <span className="text-text-secondary text-sm">{sublabel}</span>
  </label>
);

const BuyBox = ({ listing }) => {
  const canShip = listing.shippingCents !== null;
  const [fulfillment, setFulfillment] = useState(canShip ? "ship" : "pickup");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (listing.status === "sold") {
    return <p className="text-text-secondary">This piece has found a home. Keep an eye on the shop for the next one.</p>;
  }
  if (listing.status === "reserved") {
    return (
      <p className="text-text-secondary">
        Someone is checking out with this piece right now. If they don't finish, it'll be available again within 30 minutes.
      </p>
    );
  }

  const checkout = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { url } = await api("/checkout", { method: "POST", body: { slug: listing.slug, fulfillment } });
      window.location.href = url;
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  const total = listing.priceCents + (fulfillment === "ship" ? listing.shippingCents : 0);

  return (
    <div className="flex flex-col gap-3">
      {canShip && (
        <FulfillmentOption
          checked={fulfillment === "ship"}
          onChange={() => setFulfillment("ship")}
          label="Ship it to me"
          sublabel={`${formatMoney(listing.shippingCents)} · Canada only`}
        />
      )}
      {listing.pickupAvailable && (
        <FulfillmentOption
          checked={fulfillment === "pickup"}
          onChange={() => setFulfillment("pickup")}
          label="Local pickup in Toronto"
          sublabel="Free"
        />
      )}
      <Button variant="primary" onClick={checkout} disabled={submitting} className="!py-3 !text-base">
        {submitting ? "Starting checkout…" : `Buy now · ${formatMoney(total)}`}
      </Button>
      <ErrorText error={error} />
      <p className="text-xs text-text-secondary">Secure payment by Stripe. Your piece ships (or is ready for pickup) after payment.</p>
    </div>
  );
};

function RouteComponent() {
  const { slug } = Route.useParams();
  const { cancelled } = Route.useSearch();
  const navigate = useNavigate();
  const [released, setReleased] = useState(!cancelled);
  const { data: listing, error, loading, reload } = useApi(released ? `/listings/${slug}` : null);

  // Buyer backed out of Stripe Checkout: free up the board right away instead of holding it for 30 minutes.
  useEffect(() => {
    if (!cancelled) return;
    api("/checkout/cancel", { method: "POST", body: { token: cancelled } })
      .catch(() => {})
      .finally(() => {
        setReleased(true);
        navigate({ to: "/shop/$slug", params: { slug }, search: {}, replace: true });
      });
  }, [cancelled, slug, navigate]);

  useEffect(() => {
    if (listing) document.title = `${listing.title} · Joe Furfaro`;
    return () => {
      document.title = "Joe Furfaro";
    };
  }, [listing]);

  return (
    <PageLayout>
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate({ to: "/shop" })}>shop</a> },
          { title: listing?.title ?? "…" },
        ]}
      />
      {(loading || !released) && !listing && <Loading />}
      {error && (error.status === 404 ? <p className="text-text-main">This piece doesn't exist (anymore?).</p> : <ErrorText error={error} />)}
      {listing && (
        <div className="flex flex-col gap-6">
          <Gallery photos={listing.photos} title={listing.title} />
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-start gap-4">
              <h1 className="text-3xl text-text-main font-medium">{listing.title}</h1>
              {listing.status === "sold" ? <Badge>Sold</Badge> : listing.status === "reserved" ? <Badge>On hold</Badge> : null}
            </div>
            <p className="text-2xl text-text-main">{formatMoney(listing.priceCents)}</p>
          </div>
          {listing.description && <p className="text-text-main whitespace-pre-line">{listing.description}</p>}
          {listing.details && (
            <div className="flex flex-col gap-2">
              <h2 className="text-lg text-text-main font-medium">Details</h2>
              <p className="text-text-secondary whitespace-pre-line">{listing.details}</p>
            </div>
          )}
          <BuyBox key={listing.status} listing={listing} />
          {listing.status === "reserved" && (
            <button onClick={reload} className="self-start text-sm text-hyperlink hover:underline cursor-pointer">
              Check again
            </button>
          )}
        </div>
      )}
    </PageLayout>
  );
}
