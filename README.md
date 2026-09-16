# Elektro Dvořák · new e-shop

Storefront and back office for **Elektro Dvořák** (elektrodvorak.cz), the electro, appliance, computer, tool and garden-machinery retailer of Dvořák a synové, s.r.o., with six stores in Golčův Jeníkov, Čáslav, Chotěboř, Světlá nad Sázavou, Třemošnice and Heřmanův Městec.

The site is a sibling of the [Moto Dvořák storefront](https://github.com/bilguun17481/previous-web) and keeps its design system and architecture: photography-led full-bleed heroes and campaign banners with text overlays, a white header with spaced uppercase navigation, product cards on white with a buy button, hairline dividers, a light grey brand band, and a charcoal footer with newsletter and social links. What changes is the business underneath it:

| | Moto Dvořák | Elektro Dvořák |
| --- | --- | --- |
| Range | ATVs, UTVs, motorcycles, scooters, accessories | TV and audio, large and small appliances, computers and phones, power tools, garden machinery |
| Badge | Vehicle homologation (T3b, L7e…) | EU energy class (A–G) |
| Delivery rules | Vehicles: dealer delivery or pickup only | Bulky goods (large appliances, garden machines): store collection, own van or pallet freight only; parcels free over 2 000 Kč |
| Locations | One showroom | Six stores, each a free collection point, plus a stores page (`/prodejny/`) |

## Architecture

| Layer | What | Where |
| --- | --- | --- |
| Storefront | Next.js 16 App Router, Tailwind 4, CZ/EN toggle, cart, checkout | `src/app`, `src/components` |
| Catalog and stores | Bundled catalog (55 products, 6 categories), store list, default delivery options | `src/data/catalog.ts`, `src/data/stores.ts`, `src/data/shipping.ts` |
| Admin | Shopify-style back office at `/admin` | `src/app/admin`, `src/components/admin` |
| Database, auth, storage | Supabase (Postgres with row-level security, email login, `media` bucket for photos and video) | `supabase/migrations`, `supabase/seed.sql` |
| Payments | Stripe, GoPay, Comgate, PayPal, bank transfer, cash, behind one adapter interface | `src/lib/payments` |
| Delivery | Store collection (one method per store), own delivery van, Zásilkovna/Packeta, PPL, GLS (label API), DPD, Česká pošta, FOFR pallet | `src/lib/shipping` |
| Email | Order confirmations and status updates through Resend | `src/lib/notify.ts` |
| Hosting | Netlify or Cloudflare Workers run the full app; GitHub Pages serves a static storefront mirror | `netlify.toml`, `wrangler.jsonc`, `.github/workflows/pages.yml` |

Without Supabase environment variables the storefront serves the bundled catalog and the admin runs in **demo mode** (sample orders and products kept in the browser), so everything can be explored before any account exists.

## Admin features

Dashboard with revenue, orders, average order and a setup checklist · Orders with filters, CSV export, status changes, carrier label creation, tracking, customer notifications and packing slip · Products with photo upload and reordering, MP4 upload or YouTube/Vimeo links, energy class, specs, colours, tags, stock, SEO, bulk actions · Customers · Discount codes (percent, fixed, free shipping, limits, dates) · Landing page builder with hero, category tiles, product rows, campaign banners, video, brands, image+text, rich text and news sections, all with image or video backgrounds · Media library · Category headers · Analytics (90 days, top products, category, payment and shipping mix) · Settings for store info, announcement bar, payments, shipping methods (with a "bulky goods" flag), taxes, notifications, theme colours, team invites, connections and domains.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: fill in Supabase keys
npm run dev                  # http://localhost:3000, admin at /admin
npm run build && npm start
```

## Go live (Supabase + Netlify)

1. Create a project at supabase.com. In the SQL editor run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
2. On Netlify, import this repository. Add the variables from `.env.example` under Site configuration → Environment variables (at minimum the three Supabase values and `NEXT_PUBLIC_SITE_URL`).
3. Deploy. Open `/admin/login`, choose "Create the owner account" and sign up; the first account becomes the owner.
4. Add gateway and carrier keys when you have them. Each gateway's webhook URL is shown under Settings → Payments.

Gateways and carriers marked "manual" in Settings → Shipping have no public API without a contract; orders still record their tracking numbers and link to tracking pages.

## Hosting on Cloudflare Workers

The app also builds for Cloudflare Workers through OpenNext (`open-next.config.ts`, `wrangler.jsonc`). Storefront pages render fresh on every request there, so admin edits show without a redeploy.

```bash
npm run cf:build      # builds .open-next/
npm run cf:preview    # runs the worker locally with wrangler
```

On Cloudflare: Workers & Pages → Create → Workers → Import a repository → pick this repo and branch. Build command `npm run cf:build`, deploy command `npx wrangler deploy`. Add the variables from `.env.example` under both Settings → Build → Variables and secrets (needed at build time for the `NEXT_PUBLIC_*` values) and Settings → Variables and Secrets (runtime). Then set `NEXT_PUBLIC_SITE_URL` and the Supabase Auth Site URL to the worker's address.

## Static mirror on GitHub Pages

Every push runs `.github/workflows/pages.yml`, which strips the server-only parts (`src/app/api`, `src/app/admin`, `src/app/objednavka`, `src/proxy.ts`), builds with `STATIC_EXPORT=1` and a `/WEB-DEV-part-2` base path, and publishes to the `gh-pages` branch:

https://bilguun17481.github.io/WEB-DEV-part-2/

If that shows a 404 after a green run, set Settings → Pages → Source to *Deploy from a branch*, branch `gh-pages`, folder `/ (root)`.

## Catalog, stores and seed data

- `src/data/catalog.ts` holds 55 representative products across the six categories and seeds the database; once Supabase is connected the admin is the source of truth. Prices are indicative and should be checked against the shop's own list.
- `src/data/stores.ts` holds the six stores (address, phones, e-mail, hours) and the company contacts. Opening hours come from public business directories and should be re-checked with each store before launch.
- `src/data/shipping.ts` holds the default delivery and payment options. Each store becomes a free `pickup_<store>` collection method.
- `node scripts/seed.mjs` regenerates `supabase/seed.sql` from the files above and the default home page.

## Product images from elektrodvorak.cz

`npm run fetch-images` crawls elektrodvorak.cz, matches page titles to catalog products and downloads each main image into `public/products/`, writing `src/data/images.json`. Products with database images use those first. See `scripts/fetch-images.mjs` for the override map and crawl cap.
