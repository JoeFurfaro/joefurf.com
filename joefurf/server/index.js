import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { join } from "node:path";
import { config, isProd } from "./config.js";
import "./db.js";
import { adminRoutes } from "./routes/admin.js";
import { publicRoutes } from "./routes/public.js";
import { webhookRoutes } from "./routes/webhook.js";
import { getObject } from "./storage.js";

const app = new Hono();

app.use(logger());
// CORP is off so Stripe Checkout can show product photos from /media.
app.use(secureHeaders({ crossOriginResourcePolicy: false }));

// Webhook is mounted before CSRF checks: Stripe posts from its own origin and is verified by signature.
app.route("/api/stripe/webhook", webhookRoutes);
app.use(
  "/api/*",
  csrf({
    // Same-origin form posts only (covers both joefurf.com and joefurf.fly.dev).
    origin: (origin, c) => origin === config.publicUrl || URL.parse(origin)?.host === c.req.header("host"),
  }),
);
app.route("/api/admin", adminRoutes);
app.route("/api", publicRoutes);
app.all("/api/*", (c) => c.json({ error: "Not found" }, 404));

app.get("/healthz", (c) => c.text("ok"));

app.get("/media/*", async (c) => {
  const key = decodeURIComponent(c.req.path.slice("/media/".length));
  if (!/^listings\/\d+\/[a-f0-9-]+(-thumb)?\.(jpg|webp)$/.test(key)) return c.notFound();
  const file = await getObject(key);
  if (!file) return c.notFound();
  return new Response(file.stream(), {
    headers: {
      "Content-Type": key.endsWith(".webp") ? "image/webp" : "image/jpeg",
      // Keys are unique per upload, so they never change.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

// Built frontend (production). In dev, Vite serves the frontend and proxies /api + /media here.
app.use(
  "/assets/*",
  serveStatic({
    root: config.distDir,
    onFound: (_path, c) => c.header("Cache-Control", "public, max-age=31536000, immutable"),
  }),
);
app.use("*", serveStatic({ root: config.distDir }));
// SPA fallback: every other route renders the React app.
app.get("*", async (c) => {
  const index = Bun.file(join(config.distDir, "index.html"));
  if (!(await index.exists())) return c.text("Frontend not built. Run `bun run build` or use `bun run dev`.", 404);
  c.header("Cache-Control", "no-cache");
  return c.html(await index.text());
});

console.log(`[server] listening on :${config.port} (${isProd ? "production" : "development"})`);

export default {
  port: config.port,
  fetch: app.fetch,
  maxRequestBodySize: 25 * 1024 * 1024,
};
