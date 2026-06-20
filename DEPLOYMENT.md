# getIt — Production setup & go-live guide

This app is built to production quality but ships in a **safe degraded mode**
until real services are configured: with no `DATABASE_URL` it serves mock data
and renders fully; payments/uploads return clear 503s. Follow the steps below to
take it live.

## 1. Provision services

| Service | What you need |
| --- | --- |
| **PostgreSQL** | A managed DB (Neon, Supabase, RDS). Copy its connection string. |
| **Cloudflare R2** | A bucket + an S3 API token (access key/secret), account id, and a public base URL (R2 public bucket or a custom domain). |
| **PayU (India)** | Merchant key + salt (test first, then live). |
| **MSG91** | Auth key + an OTP template id (and optional sender id). |
| **Auth secret** | `openssl rand -base64 32` |

## 2. Environment variables

Copy `.env.example` → `.env` (local) / set them in your host's dashboard:

```
DATABASE_URL=postgresql://...        # real Postgres
AUTH_SECRET=...                      # random 32+ bytes
APP_URL=https://your-domain.com      # used for PayU callback URLs

MSG91_AUTH_KEY=...
MSG91_OTP_TEMPLATE_ID=...
MSG91_SENDER_ID=...

R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=getit-media
R2_PUBLIC_BASE_URL=https://media.your-domain.com

PAYU_MERCHANT_KEY=...
PAYU_MERCHANT_SALT=...
PAYU_MODE=test                       # switch to "live" for production
```

> `hasDatabase` treats the `user:password@localhost` placeholder as "no DB", so
> remember to replace it with your real URL.

## 3. Database

```bash
npm run db:push     # create the schema (or: npm run db:migrate for migrations)
npm run db:seed     # load the demo catalog (optional)
npm run db:studio   # inspect data
```

To create a **seller** (so reels can be uploaded): set a user's `role` to
`SELLER` (via Studio for now; the self-serve onboarding + KYC flow is Phase 5).

## 4. Third-party config

- **R2 CORS** — allow `PUT` from your domain so browser uploads work:
  ```json
  [{ "AllowedOrigins": ["https://your-domain.com"],
     "AllowedMethods": ["PUT","GET"],
     "AllowedHeaders": ["*"] }]
  ```
- **PayU** — the success/failure callback URL is `${APP_URL}/api/payments/payu/callback`.
  Whitelist your domain in the PayU dashboard. Start in `test` mode.
- **MSG91** — create an OTP template and put its id in `MSG91_OTP_TEMPLATE_ID`.

## 5. Build & run

```bash
npm ci
npm run build
npm start            # or deploy to Vercel/Node host
```

Recommended host: **Vercel** (set all env vars in the project settings). The
PayU callback and uploads need the Node runtime, which the API routes already
declare (`export const runtime = "nodejs"`).

## 6. Go-live checklist

- [ ] Real `DATABASE_URL` set; `db:push` run; a SELLER account exists.
- [ ] `AUTH_SECRET` set to a strong random value.
- [ ] R2 bucket public URL reachable + CORS allows `PUT` from your domain.
- [ ] MSG91 sending real OTP SMS (no dev code shown on the login screen).
- [ ] PayU in `live` mode, callback URL whitelisted, a real ₹1 test order paid.
- [ ] `APP_URL` matches the deployed domain (correct callback redirects).
- [ ] HTTPS enforced.

## What's implemented vs. remaining

**Done & verified (build/lint green):**
- Phase 1 — premium mobile UI (feed, reels, cart, profile).
- Phase 2 — Prisma schema, MSG91 phone-OTP auth (Auth.js v5, JWT).
- Phase 3 — R2 presigned uploads + client-side reel compression; create-reel flow.
- Phase 4 — checkout → PayU → orders + idempotent 5% creator cashback ledger.

**Remaining (planned):**
- Phase 5 — ShipRocket fulfilment, seller onboarding (business/bank/KYC),
  seller dashboard (sales, payouts, invoice PDF).
- Phase 6 — notifications (push/email), reviews & ratings, interest-based reel
  ranking, search, final polish.
