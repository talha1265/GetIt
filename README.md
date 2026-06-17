# getIt

An Instagram-style **social commerce** app: shoppable stories, reels, and posts with 5% cashback, built as a production-grade Next.js application.

> **Status:** Phase 1 complete — fully renderable, mobile-first premium UI on mock data. Backend (DB, auth, payments, logistics) lands in later phases.

## Stack

- **Next.js 16** (App Router, Turbopack) · React 19 · TypeScript
- **Tailwind v4** (premium-light theme via `@theme` tokens in `globals.css`)
- **Zustand** (cart state, persisted) · **lucide-react** (icons)
- _Coming:_ Prisma + PostgreSQL · Auth.js v5 + MSG91 OTP · Cloudflare R2 · PayU · ShipRocket

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

The app is designed **mobile-first** (~390px). On desktop it renders as a centered phone-width frame.

## Structure

```
src/
  app/
    (app)/            # mobile app shell: TopBar + BottomNav
      page.tsx        # home feed
      reels/          # full-screen shoppable reel feed
      cart/  profile/  create/
    globals.css       # design tokens (@theme)
  components/
    ui/               # Avatar, Button, Badge, Price, Media
    layout/           # TopBar, BottomNav
    feed/             # Stories, Categories, AdsHero, SocialBuys, PostCard, ReelsRail
    reels/            # ReelCard
    commerce/         # AddToCartButton, BuyButton
  lib/
    types.ts          # domain models (mirror future Prisma schema)
    utils.ts          # formatPrice, cashback, seeded gradients
    mock/data.ts      # fixtures (swapped for DB queries in Phase 2)
    store/cart.ts     # Zustand cart
```

## Roadmap

1. ✅ **Phase 1** — Renderable premium feed (mock data)
2. **Phase 2** — Prisma + Postgres schema, MSG91 phone-OTP auth
3. **Phase 3** — R2 media uploads + client-side reel compression
4. **Phase 4** — Cart → PayU checkout + cashback ledger
5. **Phase 5** — ShipRocket fulfilment + seller onboarding/KYC + dashboards
6. **Phase 6** — Notifications, reviews, interest ranking, polish

See `.env.example` for the environment variables each phase introduces.
