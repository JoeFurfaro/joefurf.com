import { Database } from "bun:sqlite";
import { join } from "node:path";
import { config } from "./config.js";

export const db = new Database(join(config.dataDir, "shop.db"), { create: true, strict: true });

// WAL is required for Litestream replication.
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA busy_timeout = 5000;");
db.exec("PRAGMA foreign_keys = ON;");

const migrations = [
  `
  CREATE TABLE listings (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    details TEXT NOT NULL DEFAULT '',
    price_cents INTEGER NOT NULL,
    -- NULL means pickup only
    shipping_cents INTEGER,
    pickup_available INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'available', 'sold')),
    reserved_session_id TEXT,
    -- Opaque token in the cancel URL so a buyer who backs out frees the board immediately
    reservation_token TEXT,
    reserved_until INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    published_at INTEGER,
    sold_at INTEGER
  );

  CREATE TABLE photos (
    id INTEGER PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    thumb_key TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    position INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX photos_listing ON photos(listing_id, position);

  CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id),
    stripe_session_id TEXT NOT NULL UNIQUE,
    stripe_payment_intent_id TEXT,
    fulfillment TEXT NOT NULL CHECK (fulfillment IN ('ship', 'pickup')),
    amount_total INTEGER NOT NULL,
    amount_shipping INTEGER NOT NULL DEFAULT 0,
    amount_tax INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    shipping_name TEXT,
    shipping_address TEXT,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'shipped', 'delivered', 'picked_up', 'refunded')),
    tracking_number TEXT,
    tracking_url TEXT,
    notes TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    shipped_at INTEGER,
    completed_at INTEGER
  );
  CREATE INDEX orders_status ON orders(status, created_at);
  `,
  `
  -- Blog: one vote per anonymous visitor per article (vote is 1 or -1).
  CREATE TABLE article_votes (
    article TEXT NOT NULL,
    voter_id TEXT NOT NULL,
    vote INTEGER NOT NULL CHECK (vote IN (1, -1)),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (article, voter_id)
  );

  -- Blog: private feedback, only visible in admin.
  CREATE TABLE article_feedback (
    id INTEGER PRIMARY KEY,
    article TEXT NOT NULL,
    message TEXT NOT NULL,
    name TEXT,
    email TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    read_at INTEGER
  );
  CREATE INDEX article_feedback_created ON article_feedback(created_at);
  `,
  `
  -- Blog: one row per anonymous reader per article per day (private; admin only).
  CREATE TABLE article_views (
    article TEXT NOT NULL,
    day TEXT NOT NULL,
    voter_id TEXT NOT NULL,
    PRIMARY KEY (article, day, voter_id)
  );
  `,
];

function migrate() {
  const { user_version: current } = db.query("PRAGMA user_version").get();
  for (let v = current; v < migrations.length; v++) {
    db.transaction(() => {
      db.exec(migrations[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
    })();
    console.log(`[db] applied migration ${v + 1}`);
  }
}

migrate();
