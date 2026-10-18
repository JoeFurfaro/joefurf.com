import { mkdirSync } from "node:fs";
import { join } from "node:path";

const env = process.env;

// The hash is stored base64-encoded because .env files expand `$`, which argon2 hashes are full of.
function decodeHash(value) {
  if (!value) return "";
  return value.startsWith("$") ? value : Buffer.from(value, "base64").toString("utf8");
}

export const isProd = env.NODE_ENV === "production";

export const config = {
  port: Number(env.PORT || 3000),
  // Public origin of the site, used for Stripe redirect URLs and image URLs.
  publicUrl: (env.PUBLIC_URL || "http://localhost:5173").replace(/\/$/, ""),
  dataDir: env.DATA_DIR || join(import.meta.dir, "..", "data"),
  distDir: env.DIST_DIR || join(import.meta.dir, "..", "dist"),

  adminPasswordHash: decodeHash(env.ADMIN_PASSWORD_HASH),
  sessionSecret: env.SESSION_SECRET || "",

  stripeSecretKey: env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET || "",
  // Flip on once registered for GST/HST. Requires Stripe Tax to be set up in the dashboard.
  stripeTaxEnabled: env.STRIPE_TAX_ENABLED === "true",
  currency: "cad",
  shippingCountries: ["CA"],

  resendApiKey: env.RESEND_API_KEY || "",
  emailFrom: env.EMAIL_FROM || "Joe Furfaro <shop@joefurf.com>",
  adminEmail: env.ADMIN_EMAIL || "",
  // Where buyers' replies go. Defaults to the admin inbox.
  replyTo: env.REPLY_TO || env.ADMIN_EMAIL || "",

  // Object storage for photos (Tigris on Fly). Falls back to local disk when unset.
  s3: env.BUCKET_NAME
    ? {
        bucket: env.BUCKET_NAME,
        endpoint: env.AWS_ENDPOINT_URL_S3,
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.AWS_REGION || "auto",
      }
    : null,
};

mkdirSync(config.dataDir, { recursive: true });

if (isProd) {
  for (const key of ["ADMIN_PASSWORD_HASH", "SESSION_SECRET", "PUBLIC_URL"]) {
    if (!env[key]) console.warn(`[config] ${key} is not set`);
  }
}
if (config.sessionSecret && config.sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters");
}
