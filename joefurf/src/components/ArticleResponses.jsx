import { useEffect, useState } from "react";
import { FaRegThumbsDown, FaRegThumbsUp, FaThumbsDown, FaThumbsUp } from "react-icons/fa6";
import { api, useApi } from "../lib/api";
import { GuideRule } from "./Decor";
import { Button, ErrorText, Field, Input, TextArea } from "./ui";

const VoteButton = ({ active, count, onClick, up }) => {
  const Icon = up ? (active ? FaThumbsUp : FaRegThumbsUp) : active ? FaThumbsDown : FaRegThumbsDown;
  return (
    <button
      onClick={onClick}
      className={`vote-button ${active ? "active" : ""}`}
      style={{ "--c": up ? "var(--green)" : "var(--brick)" }}
      aria-pressed={active}
      aria-label={up ? "Thumbs up" : "Thumbs down"}
    >
      <Icon key={String(active)} className="vote-icon" />
      <span className="font-mono text-xs">{count}</span>
    </button>
  );
};

const Votes = ({ slug }) => {
  const { data, setData } = useApi(`/articles/${slug}/votes`);

  const vote = async (value) => {
    const next = data?.mine === value ? 0 : value;
    // Optimistic update so the click feels instant.
    if (data) {
      const up = data.up - (data.mine === 1 ? 1 : 0) + (next === 1 ? 1 : 0);
      const down = data.down - (data.mine === -1 ? 1 : 0) + (next === -1 ? 1 : 0);
      setData({ up, down, mine: next });
    }
    try {
      setData(await api(`/articles/${slug}/vote`, { method: "POST", body: { vote: next } }));
    } catch {
      // Keep the optimistic state; a refresh shows the real count.
    }
  };

  return (
    <div className="flex flex-row gap-2.5">
      <VoteButton up active={data?.mine === 1} count={data?.up ?? "–"} onClick={() => vote(1)} />
      <VoteButton active={data?.mine === -1} count={data?.down ?? "–"} onClick={() => vote(-1)} />
    </div>
  );
};

const PrivateFeedback = ({ slug }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ message: "", name: "", email: "", website: "" });
  const [state, setState] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState(null);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState("sending");
    setError(null);
    try {
      await api(`/articles/${slug}/feedback`, { method: "POST", body: form });
      setState("sent");
    } catch (err) {
      setError(err);
      setState("idle");
    }
  };

  return (
    <div className={`accordion-item ${open ? "open" : ""}`}>
      <button onClick={() => setOpen(!open)} className="group flex flex-row items-center gap-2.5 cursor-pointer text-text-main">
        <span className="accordion-icon font-mono text-text-secondary group-hover:text-text-main">›</span>
        <span className="trail font-display text-lg" style={{ "--trail": "var(--brick)" }}>
          Leave private feedback
        </span>
      </button>
      <div className="accordion-body">
        <div>
          {state === "sent" ? (
            <p className="pt-4 pl-6 text-text-main">
              Thanks, it's on its way to me. <span className="text-text-secondary">Nobody else will see it.</span>
            </p>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4 pt-4 pl-6">
              <p className="text-text-secondary">
                Only I can read this. Leave an email if you'd like a reply; otherwise it's anonymous.
              </p>
              <Field label="Your thoughts">
                <TextArea rows={4} required maxLength={5000} value={form.message} onChange={set("message")} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name (optional)">
                  <Input value={form.name} onChange={set("name")} maxLength={100} autoComplete="name" />
                </Field>
                <Field label="Email (optional)">
                  <Input type="email" value={form.email} onChange={set("email")} maxLength={200} autoComplete="email" />
                </Field>
              </div>
              {/* Honeypot for bots: hidden from people and screen readers */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={set("website")}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <ErrorText error={error} />
              <Button variant="primary" type="submit" disabled={state === "sending" || !form.message.trim()} className="self-start">
                {state === "sending" ? "Sending…" : "Send privately"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const ArticleResponses = ({ slug }) => {
  // Count the read (privately; deduped per visitor per day on the server).
  useEffect(() => {
    api(`/articles/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return (
  <div className="flex flex-col gap-7 mt-6">
    <GuideRule label="§ responses" />
    <Votes slug={slug} />
    <PrivateFeedback slug={slug} />
  </div>
  );
};
