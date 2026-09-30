-- LUNE — reference schema for moving from mock data to real Supabase tables.
-- Not required to run the site today (it uses src/lib/mock-data.ts), but this
-- is the shape to grow into. Run in the Supabase SQL editor.

create extension if not exists "uuid-ossp";

-- Reusable trigger to keep an `updated_at` column current on every row
-- update. Defined here (before any table that uses it) since this file
-- runs top-to-bottom as one script.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Admin membership. Deliberately has NO insert/update/delete policy for the
-- anon/authenticated roles below — granting or revoking admin access can
-- only be done with the Supabase service role (e.g. the SQL editor, or a
-- trusted server-side script), never from client code. This is what makes
-- "is this user an admin" a real access-control boundary instead of
-- something a signed-in customer could grant themselves.
--
-- Defined early (before categories/products/etc.) since their RLS
-- policies reference this table.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- A signed-in user may check ONLY their own admin status — this lets the
-- app ask "am I an admin?" without being able to enumerate other admins.
drop policy if exists "Users can check their own admin status" on public.admin_users;
create policy "Users can check their own admin status"
  on public.admin_users for select
  using (auth.uid() = user_id); 

-- To grant the first admin, run this once in the Supabase SQL editor
-- (swap in the target user's id from auth.users):
--
--   insert into public.admin_users (user_id) values ('<user-uuid>');

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Categories
create table if not exists public.categories (
  slug text primary key,
  name text not null,
  description text,
  image text
);

alter table public.categories enable row level security;

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
  on public.categories for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Products
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  category_slug text references public.categories (slug),
  price integer not null, -- stored in MNT, no decimals
  compare_at_price integer,
  images text[] not null default '{}',
  colors jsonb not null default '[]',
  sizes jsonb not null default '[]',
  description text,
  details text[] not null default '{}',
  is_new boolean not null default false,
  is_featured boolean not null default false,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Columns added for the full product data model (material, care
-- instructions, per-product size chart, updated_at). Added with `alter
-- table` rather than redefining the table above so this is safe to run
-- against a project that already has the original `products` table.
alter table public.products add column if not exists material text not null default '';
alter table public.products add column if not exists care_instructions text[] not null default '{}';
alter table public.products add column if not exists size_chart jsonb not null default '[]';
alter table public.products add column if not exists updated_at timestamptz not null default now();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
  on public.products for select
  using (true);

-- Only admins can create/edit products — this is what the seed/migration
-- flow (src/lib/admin/seed-products.ts, run from /admin) relies on; it
-- writes using the signed-in admin's own session, never a service-role key.
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Per (product, size, color) stock. This is the real inventory source —
-- src/lib/inventory.ts checks this before allowing add-to-cart/checkout.
-- The legacy `products.sizes` jsonb column above stays for reference/
-- display fallback, but stock truth lives here once seeded.
create table if not exists public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null,
  color text not null,
  stock_quantity integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

alter table public.product_variants enable row level security;

-- Public read so the storefront can check "is this size/colour in stock?"
-- without requiring a login.
drop policy if exists "Product variants are publicly readable" on public.product_variants;
create policy "Product variants are publicly readable"
  on public.product_variants for select
  using (true);

drop policy if exists "Admins can insert product variants" on public.product_variants;
create policy "Admins can insert product variants"
  on public.product_variants for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update product variants" on public.product_variants;
create policy "Admins can update product variants"
  on public.product_variants for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete product variants" on public.product_variants;
create policy "Admins can delete product variants"
  on public.product_variants for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- Addresses
create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  city text not null,
  district text not null,
  address_line text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.addresses enable row level security;

drop policy if exists "Users manage their own addresses" on public.addresses;
create policy "Users manage their own addresses"
  on public.addresses for all
  using (auth.uid() = user_id);

-- Orders
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending', -- pending | confirmed | shipped | delivered | cancelled
  payment_method text not null default 'cod', -- cod | card
  subtotal integer not null,
  shipping integer not null default 0,
  total integer not null,
  shipping_address jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "Users view their own orders" on public.orders;
create policy "Users view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users create their own orders" on public.orders;
create policy "Users create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Order line items
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders (id) on delete cascade,
  product_id uuid references public.products (id),
  product_name text not null,
  image text,
  price integer not null,
  size text not null,
  color text not null,
  quantity integer not null
);

alter table public.order_items enable row level security;

drop policy if exists "Users view their own order items" on public.order_items;
create policy "Users view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Uploaded product images + Storage policies
-- (Required to run this section for the image manager's Supabase-backed
-- manifest — see src/lib/admin/image-manifest.ts. Admin auth itself —
-- public.admin_users — is defined near the top of this file.)
-- ============================================================================

-- Uploaded product photography. One row per (product, image type) — see
-- src/lib/product-images.ts for the 5 supported image_type values and the
-- Storage path convention this mirrors (product-images/<slug>/<type>.jpg).
create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_slug text not null,
  image_type text not null check (image_type in ('front', 'back', 'side', 'fabric', 'model')),
  storage_path text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_slug, image_type)
);

create index if not exists product_images_product_slug_idx
  on public.product_images (product_slug);

create index if not exists product_images_slug_order_idx
  on public.product_images (product_slug, display_order);

drop trigger if exists product_images_set_updated_at on public.product_images;
create trigger product_images_set_updated_at
  before update on public.product_images
  for each row execute function public.set_updated_at();

alter table public.product_images enable row level security;

-- Anyone (including anonymous shoppers) can read uploaded product images —
-- this is what lets the storefront show them without requiring a login.
drop policy if exists "Product images are publicly readable" on public.product_images;
create policy "Product images are publicly readable"
  on public.product_images for select
  using (true);

-- Only admins can create, replace, delete, or reorder image records.
drop policy if exists "Admins can insert product images" on public.product_images;
create policy "Admins can insert product images"
  on public.product_images for insert
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update product images" on public.product_images;
create policy "Admins can update product images"
  on public.product_images for update
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can delete product images" on public.product_images;
create policy "Admins can delete product images"
  on public.product_images for delete
  using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Storage policies for the "product-images" bucket
-- ----------------------------------------------------------------------------
-- Marking the bucket "Public" in the dashboard only affects reading files by
-- URL — write access (upload/replace/delete) is still governed by these
-- storage.objects RLS policies, which is what actually stops a non-admin
-- from uploading directly via the Supabase client even if they have a
-- valid, signed-in session (the anon key alone is not enough to bypass
-- these). Run this after creating the "product-images" bucket.

drop policy if exists "Public can view product images in storage" on storage.objects;
create policy "Public can view product images in storage"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images to storage" on storage.objects;
create policy "Admins can upload product images to storage"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users where user_id = auth.uid())
  );

drop policy if exists "Admins can replace product images in storage" on storage.objects;
create policy "Admins can replace product images in storage"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users where user_id = auth.uid())
  )
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users where user_id = auth.uid())
  );

drop policy if exists "Admins can delete product images from storage" on storage.objects;
create policy "Admins can delete product images from storage"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users where user_id = auth.uid())
  );
