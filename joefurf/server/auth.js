import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { config, isProd } from "./config.js";
import { clientIp, now, rateLimiter } from "./util.js";

const COOKIE = "admin_session";
const SESSION_SECONDS = 30 * 24 * 60 * 60;
const loginLimiter = rateLimiter({ limit: 5, windowSeconds: 15 * 60 });

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "Strict",
  path: "/",
};

export async function isAdmin(c) {
  if (!config.sessionSecret) return false;
  const value = await getSignedCookie(c, config.sessionSecret, COOKIE);
  if (!value) return false;
  const [subject, exp] = value.split(".");
  return subject === "admin" && Number(exp) > now();
}

export async function requireAdmin(c, next) {
  if (!(await isAdmin(c))) return c.json({ error: "Not logged in" }, 401);
  await next();
}

export async function login(c) {
  if (!loginLimiter(clientIp(c))) {
    return c.json({ error: "Too many attempts. Try again in a few minutes." }, 429);
  }
  if (!config.adminPasswordHash || !config.sessionSecret) {
    return c.json({ error: "Admin login is not configured (ADMIN_PASSWORD_HASH / SESSION_SECRET)." }, 503);
  }
  const { password } = await c.req.json().catch(() => ({}));
  const ok = typeof password === "string" && password.length > 0 && (await Bun.password.verify(password, config.adminPasswordHash));
  if (!ok) return c.json({ error: "Wrong password" }, 401);

  await setSignedCookie(c, COOKIE, `admin.${now() + SESSION_SECONDS}`, config.sessionSecret, {
    ...cookieOptions,
    maxAge: SESSION_SECONDS,
  });
  return c.json({ ok: true });
}

export function logout(c) {
  deleteCookie(c, COOKIE, cookieOptions);
  return c.json({ ok: true });
}
