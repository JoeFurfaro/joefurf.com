# joefurf.com
My website for personal introduction, career portfolio, blog, and a small shop for my woodworking.

- **Frontend:** React + Vite + TanStack Router + Tailwind (`joefurf/src`)
- **Backend:** Bun + Hono (`joefurf/server`), SQLite for listings and orders, Stripe Checkout for payments
- **Hosting:** one Fly.io machine with a volume for SQLite, Tigris for photos, and Litestream backing up the database to Tigris

## Local development

```bash
cd joefurf
bun install
cp .env.example .env        # then fill it in (see below)

bun run dev:server          # API on :3000
bun run dev                 # site on :5173 (proxies /api and /media to :3000)
```

- `bun run hash-password` generates `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` for `.env`. The admin page is at `/admin`.
- Photos and the database go in `joefurf/data/` locally (gitignored).
- To test payments, use Stripe **test mode** keys, then forward webhooks in a third terminal:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook   # prints the whsec_... for .env
  ```
  Pay with card `4242 4242 4242 4242`, any future date and any CVC.
- Emails are printed to the server console unless `RESEND_API_KEY` is set.

## How the shop works

1. In `/admin`, add a board, upload photos (resized in the browser, which also strips GPS data), set price/shipping, and publish.
2. A buyer chooses shipping or local pickup and clicks Buy. The server creates a Stripe Checkout Session and **reserves** the board for 30 minutes so two people can't buy it at once. If the buyer backs out, the board is released right away.
3. Stripe calls the webhook when payment succeeds. The order is saved, the board is marked sold, and emails go to me and the buyer.
4. In `/admin`, I add tracking and mark the order shipped, which emails the buyer, then delivered (or picked up).

Refunds happen in the Stripe dashboard. The order is marked refunded automatically, and the board can be relisted from admin.

**Sales tax:** off by default (small supplier, under $30k/year). After registering for GST/HST, set up Stripe Tax in the dashboard and `fly secrets set STRIPE_TAX_ENABLED=true`.

## Deploying

```bash
./joefurf/deploy.sh
```

Or run the "Deploy to Fly.io" GitHub Action.

### One-time Fly setup

```bash
cd joefurf

# Database volume (single machine, since a volume belongs to one machine)
fly volumes create joefurf_data --region ord --size 1
fly scale count 1

# Photo storage + database backups. Sets BUCKET_NAME and AWS_* secrets automatically.
fly storage create

# Secrets
bun run hash-password   # prints the command for the first two
fly secrets set ADMIN_PASSWORD_HASH=... SESSION_SECRET=...
fly secrets set STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_...
fly secrets set RESEND_API_KEY=re_... ADMIN_EMAIL=joefurf@outlook.com EMAIL_FROM="Joe Furfaro <shop@joefurf.com>"
```

Stripe webhook endpoint: `https://joefurf.com/api/stripe/webhook`, with events `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `charge.refunded`.
