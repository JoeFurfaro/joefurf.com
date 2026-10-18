import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, ErrorText, Input, Loading } from "../components/ui";
import { api, useApi } from "../lib/api";
import { formatDate, formatMoney } from "../lib/money";
import { ORDER_STATUS_LABELS } from "../lib/orders";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

const LISTING_TONES = { draft: "slate", available: "green", sold: "red" };

const Orders = () => {
  const [showAll, setShowAll] = useState(false);
  const { data: orders, error, loading } = useApi(`/admin/orders?filter=${showAll ? "all" : "open"}`);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-2xl text-text-main font-medium">{showAll ? "All orders" : "Orders to fulfil"}</h2>
        <button onClick={() => setShowAll(!showAll)} className="text-sm text-hyperlink hover:underline cursor-pointer">
          {showAll ? "show open only" : "show all"}
        </button>
      </div>
      {loading && !orders && <Loading />}
      <ErrorText error={error} />
      {orders?.length === 0 && <p className="text-text-secondary">{showAll ? "No orders yet." : "Nothing to fulfil. 🎉"}</p>}
      {orders?.map((o) => (
        <Link
          key={o.id}
          to="/admin/orders/$id"
          params={{ id: String(o.id) }}
          className="flex flex-row justify-between items-center gap-4 px-4 py-3 rounded-md border border-tag-border hover:border-text-secondary"
        >
          <div className="flex flex-col">
            <span className="text-text-main font-medium">{o.listing_title}</span>
            <span className="text-sm text-text-secondary">
              #{o.id} · {o.customer_name} · {o.fulfillment === "pickup" ? "pickup" : "ship"} · {formatDate(o.created_at)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-text-main">{formatMoney(o.amount_total)}</span>
            <Badge tone={o.status === "paid" ? "green" : "slate"}>{ORDER_STATUS_LABELS[o.status]}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
};

const NewListing = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);

  const create = async (e) => {
    e.preventDefault();
    try {
      const listing = await api("/admin/listings", { method: "POST", body: { title } });
      navigate({ to: "/admin/listings/$id", params: { id: String(listing.id) } });
    } catch (err) {
      setError(err);
    }
  };

  return (
    <form onSubmit={create} className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Input placeholder="New board title, e.g. Walnut End-Grain Board" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button variant="primary" type="submit" disabled={!title.trim()} className="shrink-0">
          Add board
        </Button>
      </div>
      <ErrorText error={error} />
    </form>
  );
};

const Listings = () => {
  const { data: listings, error, loading } = useApi("/admin/listings");

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl text-text-main font-medium">Boards</h2>
      <NewListing />
      {loading && !listings && <Loading />}
      <ErrorText error={error} />
      {listings?.map((l) => (
        <Link
          key={l.id}
          to="/admin/listings/$id"
          params={{ id: String(l.id) }}
          className="flex flex-row items-center gap-4 px-3 py-2 rounded-md border border-tag-border hover:border-text-secondary"
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-tag-background">
            {l.photos[0] && <img src={l.photos[0].thumbUrl} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex flex-col grow min-w-0">
            <span className="text-text-main font-medium truncate">{l.title}</span>
            <span className="text-sm text-text-secondary">
              {l.price_cents ? formatMoney(l.price_cents) : "No price"} · {l.photos.length} photo{l.photos.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge tone={LISTING_TONES[l.status]}>{l.status}</Badge>
            {l.reserved && <span className="text-xs text-text-secondary">in checkout</span>}
          </div>
        </Link>
      ))}
    </div>
  );
};

function RouteComponent() {
  return (
    <>
      <Orders />
      <Listings />
    </>
  );
}
