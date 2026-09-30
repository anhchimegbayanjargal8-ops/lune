# Supabase Setup — LUNE

A step-by-step guide to configuring a **new** Supabase project so the LUNE
store is fully connected: real product data, inventory, uploaded product
photography, and a protected admin area.

Do this in order — later steps depend on earlier ones (e.g. products can't
be inserted before categories exist, because of a foreign key).

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free
   account).
2. Click **New project**.
3. Choose an organization, give the project a name (e.g. `lune`), pick a
   database password (Supabase generates one for you, or set your own —
   just make sure you save it somewhere; this app never needs it directly),
   and pick a region close to your users.
4. Wait for the project to finish provisioning (usually 1–2 minutes).

---

## 2. Run the SQL schema

This one file creates every table, index, trigger, and Row Level Security
(RLS) policy the app needs — products, categories, inventory, uploaded
images, admin roles, addresses, and orders.

1. In your Supabase project, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/schema.sql` from this repo, copy its **entire contents**,
   and paste it into the query editor.
4. Click **Run**.

You should see "Success. No rows returned." If you ever need to re-run it
(e.g. after pulling an update to `schema.sql`), it's safe to run again —
every statement uses `if not exists` / `create or replace` / `drop trigger
if exists` so it won't fail or duplicate anything on a second run.

This step also **enables RLS and creates every policy** the app relies on
— there's no separate "turn on RLS" step. Specifically, it sets up:

| Table | Public can... | Only admins can... |
|---|---|---|
| `categories` | read | insert / update / delete |
| `products` | read | insert / update |
| `product_variants` (stock) | read | insert / update / delete |
| `product_images` (uploaded photos) | read | insert / update / delete |
| `admin_users` | — (each user can read only their own row) | *(granted only via SQL editor — see step 5)* |
| `profiles`, `addresses`, `orders`, `order_items` | *(each user can only read/write their own rows)* | — |

If you ever see a "permission denied" or "new row violates row-level
security policy" error from the app, it almost always means either RLS
didn't get set up correctly (re-run `schema.sql`) or the signed-in user
isn't in `admin_users` yet (see step 5).

---

## 3. Create the Storage bucket

Product photography (both the seed data's placeholders and anything you
upload through the admin dashboard) is stored in one Supabase Storage
bucket.

1. Open **Storage** in the sidebar.
2. Click **New bucket**.
3. Name it exactly: `product-images`
4. Toggle **Public bucket** on.
5. Click **Create bucket**.

The bucket being "Public" only controls whether files can be *read* by
URL without authentication — it does **not** allow uploads/replacements/
deletes from just anyone. That's governed separately by the Storage
policies already created for you at the bottom of `schema.sql` in step 2
(they restrict writes to users in `admin_users`). If you create the bucket
*after* running `schema.sql`, that's fine — the policies reference the
bucket by name and don't require it to exist yet.

---

## 4. Set environment variables

1. In Supabase, open **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key (not the
   `service_role` key — that one must never be used in this app; see the
   security note at the end of this guide).
3. In this project, copy `.env.local.example` to a new file named
   `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

4. Fill in the two values you just copied:

   ```
   NEXT_PUBLIC_SUPABASE_URL=<your Project URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon public key>
   ```

5. Restart the dev server (`npm run dev`) so the new environment variables
   are picked up.

Until this step is done, the app runs in "demo mode" — it works, but with
mock product data, no real accounts, and no admin area (see the README's
"Running without Supabase" section).

---

## 5. Create your admin account

There's deliberately no sign-up flow for admins and no admin password
baked into the app — admin access is a real, database-backed role, granted
by hand the first time.

1. **Create a normal account** through the storefront: go to
   `/account/register` and sign up with your own email/password, just like
   any customer would.
2. **Find your user id.** In Supabase, open **Authentication → Users**.
   Find the account you just created and copy its **User UID** (a UUID like
   `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
3. **Grant admin access.** Open **SQL Editor → New query** and run (with
   your real UID pasted in):

   ```sql
   insert into public.admin_users (user_id)
   values ('<paste-your-user-uid-here>');
   ```

4. Sign out and back in on the storefront (or just visit `/admin`) — you
   should now land on the admin dashboard instead of being redirected.

To promote additional admins later, repeat steps 2–3 for their account.
There's no UI for this by design — it's meant to require direct database
access, not be reachable from the app itself.

---

## 6. Seed the product catalog

1. Sign in as your new admin and go to `/admin/products`.
2. At the top of the page, the **"Seed Products from Mock Data"** panel
   shows how many of the 26 built-in products currently exist in Supabase.
3. Click **Seed Products**.

This imports all 26 products (from `src/lib/mock-data.ts`) along with
their categories and per-size/colour inventory into the real database. It's
safe to click more than once — every row is **upserted** by a unique key
(`slug` for products/categories, `product_id + size + color` for
inventory), so re-running it updates existing rows instead of creating
duplicates. Once everything is imported, the panel shows **"All products
are already synced."**

---

## 7. Verify everything is working

Go through this checklist:

- [ ] `/admin` redirects you to `/account/login` when signed out
- [ ] `/admin` redirects a signed-in **non-admin** account to `/account`
      (test with a second account you don't add to `admin_users`)
- [ ] `/admin/products` shows "26 of 26 products in Supabase" and "All
      products are already synced" after seeding
- [ ] `/admin/products/<any-product>` lets you upload a front/back/side/
      fabric/model image, and the preview updates
- [ ] The product's live page (`/product/<slug>`) shows the image you just
      uploaded, not the placeholder
- [ ] Reloading the page keeps the uploaded image (confirms it's reading
      from the `product_images` table / Storage, not just local state)
- [ ] Opening the same product page in a different browser (or an
      incognito window) also shows the uploaded image (confirms it's not
      something cached only on your machine)
- [ ] In Supabase's **Table Editor**, `products` has 26 rows,
      `product_variants` has one row per size/colour combination, and
      `categories` has 6 rows

If something doesn't match, re-check step 2 (schema run cleanly?), step 3
(bucket named exactly `product-images`, marked Public?), and step 5 (is
your user's UID actually present in `admin_users`?).

---

## Security notes

- **Never** put your Supabase `service_role` key in this app, in
  `.env.local`, or anywhere in the codebase — only the two `NEXT_PUBLIC_*`
  values above are used, anywhere. Every admin action (uploading images,
  seeding products) runs with the signed-in admin's own session and is
  enforced by the RLS policies from step 2, not by a privileged key.
- Don't paste real credentials, keys, or connection strings into shared
  documents, chat, or version control — this guide intentionally shows
  only placeholders like `<your Project URL>` for values that are specific
  to your project.
