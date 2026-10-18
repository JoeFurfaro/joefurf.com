import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "../components/PageLayout";
import { ErrorText, Loading } from "../components/ui";
import { useApi } from "../lib/api";
import { formatMoney } from "../lib/money";

export const Route = createFileRoute("/shop/thanks")({
  component: RouteComponent,
  validateSearch: (search) => ({ session_id: typeof search.session_id === "string" ? search.session_id : undefined }),
});

function RouteComponent() {
  const { session_id } = Route.useSearch();
  const { data, error, loading } = useApi(session_id ? `/checkout/session/${encodeURIComponent(session_id)}` : null);

  return (
    <PageLayout>
      {loading && session_id && <Loading />}
      <ErrorText error={error} />
      {data?.paid && (
        <div className="flex flex-col gap-4 text-text-main">
          <h1 className="font-medium text-3xl">Thank you! 🙏</h1>
          <p>
            Your payment of {formatMoney(data.amountTotal)} for <span className="font-medium">{data.title}</span> went through.
            A receipt is on its way to {data.email}.
          </p>
          <p>
            {data.fulfillment === "pickup"
              ? "I'll email you soon to set up a pickup time in Toronto."
              : "I'll pack it up carefully and email you a tracking number once it ships."}
          </p>
          <Link to="/shop" className="trail self-start">
            Back to the shop
          </Link>
        </div>
      )}
      {data && !data.paid && (
        <p className="text-text-main">
          Your payment hasn't gone through yet. If you think this is a mistake, reach out and I'll sort it out.
        </p>
      )}
    </PageLayout>
  );
}
