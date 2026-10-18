import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { findArticle } from "../articles.js";
import { config, isProd } from "../config.js";
import { db } from "../db.js";
import { sendEmail } from "../email.js";
import { clientIp, now, rateLimiter } from "../util.js";

export const blogRoutes = new Hono();

const VOTER_COOKIE = "voter";
const voteLimiter = rateLimiter({ limit: 60, windowSeconds: 60 * 60 });
const feedbackLimiter = rateLimiter({ limit: 5, windowSeconds: 60 * 60 });

// Anonymous, per-browser id so each visitor gets one vote they can change or undo.
function voterId(c, { create = false } = {}) {
  let id = getCookie(c, VOTER_COOKIE);
  if (!id && create) {
    id = crypto.randomUUID();
    setCookie(c, VOTER_COOKIE, id, { httpOnly: true, secure: isProd, sameSite: "Lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return id ?? null;
}

function tally(slug, voter) {
  const counts = db
    .query("SELECT SUM(vote = 1) AS up, SUM(vote = -1) AS down FROM article_votes WHERE article = ?")
    .get(slug);
  const mine = voter ? db.query("SELECT vote FROM article_votes WHERE article = ? AND voter_id = ?").get(slug, voter)?.vote ?? 0 : 0;
  return { up: counts.up ?? 0, down: counts.down ?? 0, mine };
}

blogRoutes.use("/:slug/*", async (c, next) => {
  const article = await findArticle(c.req.param("slug"));
  if (!article) return c.json({ error: "Not found" }, 404);
  c.set("article", article);
  await next();
});

// Crawlers and link-preview fetchers shouldn't count as readers.
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|curl|wget|python|headless/i;
const viewLimiter = rateLimiter({ limit: 120, windowSeconds: 60 * 60 });

// Records one view per visitor per article per day. Never exposed publicly.
blogRoutes.post("/:slug/view", (c) => {
  if (BOT_UA.test(c.req.header("user-agent") ?? "") || !viewLimiter(clientIp(c))) return c.body(null, 204);
  const day = new Date().toISOString().slice(0, 10);
  db.query("INSERT OR IGNORE INTO article_views (article, day, voter_id) VALUES (?, ?, ?)").run(
    c.get("article").slug,
    day,
    voterId(c, { create: true }),
  );
  return c.body(null, 204);
});

blogRoutes.get("/:slug/votes", (c) => c.json(tally(c.get("article").slug, voterId(c))));

// vote: 1 (up), -1 (down), or 0 (undo).
blogRoutes.post("/:slug/vote", async (c) => {
  if (!voteLimiter(clientIp(c))) return c.json({ error: "Slow down a little." }, 429);
  const { vote } = await c.req.json().catch(() => ({}));
  if (![1, -1, 0].includes(vote)) return c.json({ error: "Invalid vote" }, 400);
  const slug = c.get("article").slug;
  const voter = voterId(c, { create: true });
  if (vote === 0) {
    db.query("DELETE FROM article_votes WHERE article = ? AND voter_id = ?").run(slug, voter);
  } else {
    db.query(
      `INSERT INTO article_votes (article, voter_id, vote) VALUES (?, ?, ?)
       ON CONFLICT (article, voter_id) DO UPDATE SET vote = excluded.vote, updated_at = ?`,
    ).run(slug, voter, vote, now());
  }
  return c.json(tally(slug, voter));
});

blogRoutes.post("/:slug/feedback", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  // Honeypot: real visitors never see this field. Pretend it worked.
  if (body.website) return c.json({ ok: true });
  if (!feedbackLimiter(clientIp(c))) return c.json({ error: "You've sent a few already. Try again later." }, 429);

  const message = String(body.message ?? "").trim();
  const name = String(body.name ?? "").trim().slice(0, 100) || null;
  const email = String(body.email ?? "").trim().slice(0, 200) || null;
  if (message.length < 2) return c.json({ error: "Write a little something first." }, 400);
  if (message.length > 5000) return c.json({ error: "That's a bit long. Keep it under 5000 characters." }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: "That email doesn't look right." }, 400);

  const article = c.get("article");
  const row = db
    .query("INSERT INTO article_feedback (article, message, name, email) VALUES (?, ?, ?, ?) RETURNING id")
    .get(article.slug, message, name, email);

  sendEmail({
    to: config.adminEmail,
    subject: `Private feedback on "${article.title}"`,
    replyTo: email ?? undefined,
    text: [
      `From: ${name ?? "anonymous"}${email ? ` <${email}>` : ""}`,
      "",
      message,
      "",
      `${config.publicUrl}/admin/feedback#${row.id}`,
    ].join("\n"),
  }).catch((err) => console.error("[feedback] email failed:", err));

  return c.json({ ok: true });
});
