import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageLayout } from "../components/PageLayout";
import { Badge, ErrorText, Loading } from "../components/ui";
import { useApi } from "../lib/api";
import { formatMoney } from "../lib/money";

export const Route = createFileRoute("/shop/")({
  component: RouteComponent,
  validateSearch: (search) => ({ view: search.view === "sold" ? "sold" : undefined }),
});

const Tab = ({ label, count, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`cursor-pointer hover:underline ${selected ? "text-hyperlink" : "text-text-main hover:text-text-secondary"}`}
  >
    {label} <span className="text-text-secondary">({count})</span>
  </button>
);

const ListingCard = ({ listing }) => {
  const unavailable = listing.status !== "available";
  return (
    <Link to="/shop/$slug" params={{ slug: listing.slug }} className="group flex flex-col gap-2">
      <div className="aspect-square overflow-hidden rounded-md border border-tag-border bg-tag-background">
        {listing.cover && (
          <img
            src={listing.cover.thumbUrl}
            alt={listing.title}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${listing.status === "sold" ? "opacity-60" : ""}`}
          />
        )}
      </div>
      <div className="flex flex-row justify-between items-start gap-2">
        <p className="text-text-main font-medium group-hover:underline">{listing.title}</p>
        {unavailable ? (
          <Badge>{listing.status === "sold" ? "Sold" : "On hold"}</Badge>
        ) : (
          <p className="text-text-main shrink-0">{formatMoney(listing.priceCents)}</p>
        )}
      </div>
    </Link>
  );
};

function RouteComponent() {
  const { data: listings, error, loading } = useApi("/listings");
  const available = listings?.filter((l) => l.status !== "sold") ?? [];
  const sold = listings?.filter((l) => l.status === "sold") ?? [];
  const { view } = Route.useSearch();
  const navigate = useNavigate();
  const showSold = view === "sold" && sold.length > 0;
  const setView = (next) => navigate({ to: "/shop", search: { view: next }, replace: true });

  return (
    <PageLayout>
      <h1 className="font-medium text-text-main text-3xl">Shop</h1>
      <div className="flex flex-col gap-4 text-text-main">
        <p>
          I've started woodworking! Everything here was made by hand in my basement.
        </p>
        <p className="text-text-secondary">
          Every piece is a one-off. Once it's sold, it's gone. Shipping in Canada, or free local pickup in Toronto.
        </p>
      </div>

      {loading && !listings && <Loading />}
      <ErrorText error={error} />

      {listings && (
        <>
          {sold.length > 0 && (
            <div className="flex flex-row gap-4 border-b border-tag-border pb-2">
              <Tab label="for sale" count={available.length} selected={!showSold} onClick={() => setView(undefined)} />
              <Tab label="sold" count={sold.length} selected={showSold} onClick={() => setView("sold")} />
            </div>
          )}

          {showSold ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sold.map((l) => (
                <ListingCard key={l.slug} listing={l} />
              ))}
            </div>
          ) : available.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {available.map((l) => (
                <ListingCard key={l.slug} listing={l} />
              ))}
            </div>
          ) : (
            <p className="text-text-secondary italic">
              Nothing for sale right now. The next piece is on the workbench. Check back soon!
            </p>
          )}
        </>
      )}
    </PageLayout>
  );
}
