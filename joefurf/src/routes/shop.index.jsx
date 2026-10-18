import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageLayout } from "../components/PageLayout";
import { ErrorText, Loading } from "../components/ui";
import { PageTitle } from "../components/Decor";
import { Inlay } from "../components/Joinery";
import { PAGES } from "../lib/pages";
import { useApi } from "../lib/api";
import { catalogNumber, formatMonth, formatPrice } from "../lib/money";

export const Route = createFileRoute("/shop/")({
  component: RouteComponent,
  validateSearch: (search) => ({ view: search.view === "sold" ? "sold" : undefined }),
});

const Tab = ({ label, count, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`nav-link relative flex flex-row items-baseline gap-1.5 cursor-pointer font-display text-lg ${selected ? "selected" : "text-text-main"}`}
    style={{ "--c": "var(--teal)" }}
  >
    {label} <span className="font-mono text-xs text-text-secondary">{count}</span>
    <span className="nav-underline" />
  </button>
);

const ListingCard = ({ listing }) => {
  const sold = listing.status === "sold";
  return (
    <Link to="/shop/$slug" params={{ slug: listing.slug }} className={`field-card group ${sold ? "sold" : ""}`}>
      <div className="field-photo aspect-square bg-tag-background">
        {listing.cover && <img src={listing.cover.thumbUrl} alt={listing.title} loading="lazy" className="h-full w-full object-cover" />}
      </div>
      {!sold && listing.status !== "reserved" && <span className="price-tag">{formatPrice(listing.priceCents)}</span>}
      <span className="flex flex-row items-center justify-between gap-2">
        <span className="font-mono text-xs text-text-secondary">{catalogNumber(listing.number)}</span>
        {sold && <span className="sold-label">Sold · {formatMonth(listing.soldAt)}</span>}
        {listing.status === "reserved" && <span className="sold-label !text-ochre">On hold</span>}
      </span>
      <span className="font-display text-xl leading-tight text-text-main">{listing.title}</span>
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
      <PageTitle page={PAGES[3]}>Shop</PageTitle>
      <div className="flex flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-4 text-text-main">
          <p>
            I've started woodworking! Everything here was made by hand in my basement.
          </p>
          <p className="text-text-secondary">
            Every piece is a one-off. Once it's sold, it's gone. Shipping in Canada, or free local pickup in Toronto.
          </p>
        </div>
        <Inlay size={120} px={150} className="hidden sm:block shrink-0" />
      </div>

      {loading && !listings && <Loading />}
      <ErrorText error={error} />

      {listings && (
        <>
          {sold.length > 0 && (
            <div className="flex flex-row gap-6 border-b border-dashed border-rule pb-2.5">
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
