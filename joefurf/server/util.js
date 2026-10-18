export const now = () => Math.floor(Date.now() / 1000);

export function formatMoney(cents, currency = "cad") {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "board";
}

// Simple fixed-window in-memory rate limiter. Fine for a single machine.
export function rateLimiter({ limit, windowSeconds }) {
  const hits = new Map();
  return (key) => {
    const t = now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      hits.set(key, { count: 1, resetAt: t + windowSeconds });
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
      }
      return true;
    }
    entry.count++;
    return entry.count <= limit;
  };
}

export function clientIp(c) {
  return c.req.header("fly-client-ip") || c.req.header("x-forwarded-for")?.split(",")[0].trim() || "local";
}
