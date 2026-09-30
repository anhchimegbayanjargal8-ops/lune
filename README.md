# LUNE — Premium Fashion E-Commerce (Mongolia)

A minimal, editorial fashion storefront built with Next.js, TypeScript,
Tailwind CSS, and Supabase — priced in Mongolian Tögrög (₮), designed for
customers in Ulaanbaatar and across Mongolia.

> **Setting up Supabase from scratch?** Follow **[`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)**
> for the full zero-to-configured walkthrough (schema, Storage bucket, env
> vars, first admin, seeding). This README covers the rest of the project.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** — custom design system (see `tailwind.config.ts`)
- **Supabase** — authentication (email/password) + a reference schema for
  products/orders once you're ready to move off mock data
- Fully responsive — mobile, tablet, desktop

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase keys
npm run dev
```

Open http://localhost:3000.

### Running without Supabase

The site works immediately with **no configuration** — the product catalog
is mock data (`src/lib/mock-data.ts`), and the cart runs entirely in
localStorage. Auth-related pages (Sign In / Register / Account) will detect
that Supabase isn't configured and show a "demo mode" notice instead of
crashing, so you can preview the full UI before wiring up a real backend.

### Connecting Supabase (auth)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the Project URL and anon public key
   into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
   ```
3. Restart `npm run dev`. Sign up / sign in on `/account/register` and
   `/account/login` now work against real Supabase Auth.
4. (Optional) Run `supabase/schema.sql` in the Supabase SQL editor when
   you're ready to move products, orders, and addresses off mock data and
   into real tables — see "Moving off mock data" below.

## What's functional today

- Full navigation: Home, Shop, New Arrivals, Categories, About, My Account, Cart
- Product listing with **live filtering** (category, size) and **sorting**
  (newest, price, rating)
- **26 realistic products** (18 originals + 8 core basics — T-shirt, blazer,
  wide-leg jeans, cardigan, white shirt, satin dress, denim jacket, trousers)
  each with its own material, care instructions, product details, stock
  quantity per size, and its own size chart
- Product detail pages with image gallery, colour/size selection, real
  out-of-stock states per size, and low-stock messaging
- **Find My Size** — a measurement-based size finder on every sized product.
  Collects height, weight, bust, waist, hip and a fit preference, then scores
  every size in *that specific product's* size chart (not a generic one) to
  return a recommended size, a match percentage, and a plain-English
  explanation — plus a breakdown of how every other size would fit
  ("More fitted" / "Recommended" / "Relaxed" / "Oversized"). The algorithm
  lives in `src/lib/size-recommendation.ts` and is fully reusable — it just
  takes measurements + a size chart, so it works the same way for every
  product without per-product logic.
- **My Size Profile** — signed-in customers can save their measurements from
  the account dashboard (or straight from the Find My Size results) and have
  them pre-fill the finder on every future product.
- Cart persisted in `localStorage`, with a slide-out drawer and a full
  `/cart` page — quantity updates and line removal both work
- **Checkout flow** that collects a real shipping address, validates it,
  and completes an order via **Cash on Delivery** (no payment gateway is
  connected yet, as requested — card payment is shown but disabled)
- Real authentication via Supabase (sign up, sign in, sign out, session
  persistence) with a protected account dashboard
- **Admin → Product Image Manager** (`/admin`, protected — see below) —
  upload, replace, delete, and reorder each product's 5 shots (front, back,
  side/detail, fabric close-up, on-model) straight to the same Supabase
  Storage `product-images` bucket the storefront reads from. Validates file
  type (JPG/PNG/WEBP) and size (5MB), shows an uploading state, and
  surfaces clear errors. Uploaded images appear on the live product page
  and product cards automatically — no redeploy needed. See "Admin
  authentication" and "Admin image uploads" below for how this is wired.
- Fully responsive layout, keyboard-focus states, and `prefers-reduced-motion`
  support

## Admin authentication

`/admin`, `/admin/products`, and `/admin/products/[slug]` are all protected,
at two independent layers:

1. **`src/middleware.ts`** — runs before every request. If the path starts
   with `/admin`: no session → redirect to `/account/login`; signed in but
   not an admin → redirect to `/account`; Supabase not configured at all →
   redirect to `/account/login` (fails closed — with no way to authenticate
   anyone, admin is simply unreachable rather than left open).
2. **`src/app/admin/layout.tsx`** — calls `requireAdmin()`
   (`src/lib/admin/auth.ts`) again server-side, as defense-in-depth, so the
   whole `/admin` subtree stays protected even if the middleware matcher
   ever changes.

"Admin" is a real role, not a hardcoded password: a `public.admin_users`
table (`user_id` → `auth.users.id`) is the source of truth, checked via
`src/lib/admin/is-admin.ts`. Its Row Level Security policy only lets a
signed-in user read *their own* row — there's no INSERT/UPDATE/DELETE policy
for regular users at all, so granting admin access requires the Supabase
SQL editor (or another trusted server-side context), never client code:

```sql
insert into public.admin_users (user_id) values ('<user-uuid-from-auth.users>');
```

No service-role key is used or exposed anywhere in this app — every check
above runs with the same anon/session-scoped client the rest of the app
uses, relying entirely on RLS.

## Admin image uploads

`/admin` → `/admin/products` → pick a product → upload each shot. This reuses
the exact Storage bucket/convention from the placeholder-image system
(`product-images/<slug>/<type>.jpg` — see `src/lib/supabase/storage.ts`), so
there's only ever one image storage system.

**Persistence:** which images have actually been uploaded is recorded in the
`public.product_images` table (`product_slug`, `image_type`, `storage_path`,
`display_order`, timestamps — see `supabase/schema.sql`), not in
`localStorage`. `src/lib/admin/image-manifest.ts` reads/writes that table
and is the only place that talks to it; a `localStorage` copy is kept
alongside purely as a fallback (for local/dev use before the table exists,
or if Supabase is briefly unreachable) — the database wins whenever it's
configured and reachable. `src/hooks/useProductImages.ts` is the bridge used
by the storefront: it returns a product's base (placeholder/override) images
until a row exists for that type, then swaps it in — used by `ProductCard`
and `ProductGalleryConnected` (a thin wrapper so the existing
`ProductGallery` component itself stays untouched).

**Security:** reading `product_images` is public (RLS: `using (true)`) so
the storefront can show uploaded photos to anyone, including signed-out
shoppers. Writing to it — and writing to the `product-images` Storage
bucket itself — is restricted to rows in `admin_users` by RLS policies on
both the table and `storage.objects`. This means even a signed-in customer
calling the Supabase client directly (bypassing the UI entirely) cannot
upload, replace, delete, or reorder images — the database and Storage
enforce it independent of the admin dashboard's own page-level protection.

## What's intentionally mocked / stubbed

- **Product data** lives in `src/lib/mock-data.ts` — swap this module for
  Supabase queries (see `supabase/schema.sql`) without touching any UI
  components; every page reads through the functions at the bottom of that
  file (`getAllProducts`, `getProductBySlug`, etc.)
- **Payment processing** — checkout supports Cash on Delivery only. Card
  payment is visibly disabled with a "coming soon" label, per the brief.
- **Order history** — the account dashboard has the UI for order history
  and saved addresses, but reads from `public.orders` / `public.addresses`
  are not wired up yet (orders aren't currently written to Supabase on
  checkout — see below).
- **Saved measurements** are stored in the Supabase user's `user_metadata`
  (no extra table needed for the demo) — see `saveSizeProfile` in
  `src/context/AuthContext.tsx`. Move this to a dedicated `size_profiles`
  table if you want it queryable outside of auth.
- **Product images** default to placeholder photography (`picsum.photos`,
  seeded per product so they're stable) until replaced via the Admin image
  uploader, a hardcoded override in `src/lib/product-images.ts`, or real
  product data — see "Admin image uploads" above.
- **Admin membership** must be granted manually via one SQL insert into
  `admin_users` (see "Admin authentication" above) — there's no UI for
  promoting a user to admin, by design, since that action must never be
  reachable from client code.
- **Image manifest fallback**: if Supabase is unreachable, uploads/edits
  still write to a local-only `localStorage` copy so the admin UI doesn't
  break — but that data won't sync anywhere else until Supabase is back and
  a fresh upload is made through it. Treat it as emergency-only, not a
  second source of truth.

## Project structure

```
src/
  app/                     Routes (App Router)
    page.tsx                 Home
    shop/                    Shop (all products)
    new-arrivals/             New Arrivals
    categories/                Categories index + /[slug] detail
    product/[slug]/            Product detail
    cart/                       Cart
    checkout/                   Checkout (COD)
    about/                      About
    account/                    Dashboard, /login, /register
    admin/                      Dashboard, /products, /products/[slug]
                                 (protected — see "Admin authentication")
  components/
    layout/                  Header, Footer, MobileMenu, CartDrawer
    ui/                      Button, PriceTag, Badge, SectionHeading,
                              Accordion, Modal, QuantitySelector,
                              CrescentMark…
    product/                 ProductCard, ProductGrid, ProductBrowser,
                              ProductGallery, ProductGalleryConnected,
                              PurchasePanel, RelatedProducts,
                              SizeChartTable, SizeFinderModal
    home/                    Hero, CategoryShowcase, FeaturedProducts,
                              Editorial, PromoBanner, MarqueeStrip
    account/                 AuthForm, SizeProfileForm
    admin/                   ProductImageManager
  context/
    CartContext.tsx          Cart state + localStorage persistence
    AuthContext.tsx          Supabase auth state + size profile save/load
  hooks/
    useProductImages.ts      Layers admin uploads over a product's base images
  lib/
    supabase/                Browser + server Supabase clients, Storage
                              upload/delete/validate helpers
    admin/
      is-admin.ts              Edge-safe admin_users check (used by middleware)
      auth.ts                  requireAdmin() Server Component guard
      image-manifest.ts        product_images table reader/writer (+ local fallback)
    types.ts                 Shared TypeScript types
    mock-data.ts             Product catalog (swap for Supabase later)
    product-images.ts        Product image resolution — placeholders,
                              overrides, and the Storage naming convention
    size-recommendation.ts   Reusable measurement → size-chart matching algorithm
    constants.ts              Site config, nav, categories
    utils.ts                  formatMNT, cn, slugify…
  middleware.ts              Session refresh + /admin auth/role redirect
supabase/
  schema.sql                Run this — products/orders/addresses reference
                             schema, plus the required admin_users and
                             product_images tables/policies
```

**Manual Supabase setup required for admin + uploads:**
1. Run the full `supabase/schema.sql` in the Supabase SQL editor (safe to
   re-run — everything uses `if not exists` / `create or replace`).
2. Create a Storage bucket named `product-images` (Storage → New bucket →
   mark it **Public**), then run the Storage policies at the bottom of
   `schema.sql` (they reference that bucket by name).
3. Sign up a user through the storefront's normal `/account/register`, then
   grant them admin in the SQL editor:
   `insert into public.admin_users (user_id) values ('<their auth.users id>');`

Until all three are done, `/admin` redirects to `/account/login` for
everyone (fails closed) rather than being left open.

## Design system

- **Palette** — warm ivory background, near-black ink, a muted dusty-rose
  accent, soft taupe for secondary text (see `tailwind.config.ts`)
- **Type** — Cormorant Garamond (display) paired with Inter (body/UI)
- **Signature mark** — a crescent moon (LUNE = "moon" in French), used as
  the logomark, section-heading accent, and loading indicator

## Moving off mock data

When you're ready to connect real products:

1. Run `supabase/schema.sql` in your Supabase project.
2. Insert products (or build an admin flow — not included here).
3. Replace the body of the functions in `src/lib/mock-data.ts`
   (`getAllProducts`, `getProductBySlug`, `getProductsByCategory`, etc.)
   with Supabase queries using `createServerSupabaseClient()` /
   `createClient()`. Because every page/component already calls through
   these functions, no other file needs to change.
4. To persist orders on checkout, add an insert into `public.orders` /
   `public.order_items` inside `src/app/checkout/page.tsx`'s submit handler.

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run production build
npm run lint     # lint
```
