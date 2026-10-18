import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, ErrorText, Loading } from "../components/ui";
import { SectionHeading } from "../components/Decor";
import { api, useApi } from "../lib/api";
import { formatDate } from "../lib/money";

export const Route = createFileRoute("/admin/feedback")({
  component: RouteComponent,
});

const FeedbackItem = ({ item, onChange, onDelete }) => {
  const [confirm, setConfirm] = useState(false);
  const unread = !item.read_at;

  const toggleRead = async () => onChange(await api(`/admin/feedback/${item.id}`, { method: "PATCH", body: { read: unread } }));
  const remove = async () => {
    await api(`/admin/feedback/${item.id}`, { method: "DELETE" });
    onDelete(item.id);
  };

  return (
    <div id={String(item.id)} className={`flex flex-col gap-2 p-4 rounded-[4px] border ${unread ? "border-text-secondary bg-card" : "border-rule"}`}>
      <div className="flex flex-row flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-lg text-text-main">{item.title}</span>
        <span className="flex flex-row items-center gap-2">
          {unread && <Badge tone="green">new</Badge>}
          <span className="font-mono text-xs text-text-secondary">{formatDate(item.created_at)}</span>
        </span>
      </div>
      <p className="text-text-main whitespace-pre-line">{item.message}</p>
      <p className="text-sm text-text-secondary">
        {item.name ?? "Anonymous"}
        {item.email && (
          <>
            {" · "}
            <a href={`mailto:${item.email}`} className="trail">
              {item.email}
            </a>
          </>
        )}
      </p>
      <div className="flex flex-row flex-wrap items-center gap-2 pt-1">
        <Button onClick={toggleRead} className="!py-1 !text-sm">
          {unread ? "Mark read" : "Mark unread"}
        </Button>
        {confirm ? (
          <>
            <Button variant="danger" onClick={remove} className="!py-1 !text-sm">
              Yes, delete
            </Button>
            <Button onClick={() => setConfirm(false)} className="!py-1 !text-sm">
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="danger" onClick={() => setConfirm(true)} className="!py-1 !text-sm">
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

function RouteComponent() {
  const { data, error, loading, setData } = useApi("/admin/feedback");

  const update = (row) => setData({ ...data, feedback: data.feedback.map((f) => (f.id === row.id ? { ...f, ...row } : f)) });
  const drop = (id) => setData({ ...data, feedback: data.feedback.filter((f) => f.id !== id) });

  if (loading && !data) return <Loading />;
  if (error) return <ErrorText error={error} />;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-medium text-text-main text-3xl">Blog feedback</h1>

      <SectionHeading number="01" color="green">
        Posts
      </SectionHeading>
      {data.stats.length === 0 ? (
        <p className="text-text-secondary">No reads or votes yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs text-text-secondary">
            views = unique readers per day · readers = unique visitors overall · views are private
          </p>
          {data.stats.map((v) => (
            <div key={v.article} className="flex flex-row flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-text-main">{v.title}</span>
              <span className="leader" />
              <span className="font-mono text-sm text-text-main">{v.views} views</span>
              <span className="font-mono text-xs text-text-secondary">
                {v.readers} readers · {v.views_week} this week
              </span>
              <span className="font-mono text-sm text-green">▲ {v.up}</span>
              <span className="font-mono text-sm text-brick">▼ {v.down}</span>
            </div>
          ))}
        </div>
      )}

      <SectionHeading number="02" color="brick">
        Private feedback
      </SectionHeading>
      {data.feedback.length === 0 ? (
        <p className="text-text-secondary">Nothing yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.feedback.map((item) => (
            <FeedbackItem key={item.id} item={item} onChange={update} onDelete={drop} />
          ))}
        </div>
      )}
    </div>
  );
}
