import { ProductImageType, PRODUCT_IMAGE_TYPE_ORDER } from "@/lib/product-images";
import { createClient } from "@/lib/supabase/client";

const LOCAL_STORAGE_KEY = "lune_admin_image_manifest_v1";
export const MANIFEST_UPDATED_EVENT = "lune:image-manifest-updated";

export interface ManifestEntry {
  /** Storage path, e.g. "silk-slip-dress-ivory/front.jpg" */
  path: string;
  /** Changes on every replace, used to cache-bust the browser/CDN image cache. */
  version: number;
  updatedAt: string;
}

interface SlugManifest {
  images: Partial<Record<ProductImageType, ManifestEntry>>;
  /** Full 5-type display order — uploaded images first (admin's chosen
   *  order), then any not-yet-uploaded types in their default position. */
  order: ProductImageType[];
}

type ImageManifest = Record<string, SlugManifest>;

/**
 * The `product_images` Supabase table (see supabase/schema.sql) is the
 * primary source of truth for uploaded images — readable by everyone
 * (RLS: public select), writable only by admins (RLS: admin_users check).
 * The localStorage copy below is kept only as a fallback: for local/dev
 * use before the table has been migrated, and so existing manifest data
 * from earlier sessions doesn't just disappear. Whenever Supabase is
 * configured and reachable, it wins.
 */
function readLocalManifest(): ImageManifest {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ImageManifest) : {};
  } catch {
    return {};
  }
}

function writeLocalManifest(manifest: ImageManifest) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(manifest));
}

/** Merges the admin's uploaded-image order with default positions for
 *  anything not uploaded yet, so callers always get all 5 image types back
 *  regardless of how many have actually been uploaded. */
function mergeOrder(uploadedTypesInOrder: ProductImageType[]): ProductImageType[] {
  const remaining = PRODUCT_IMAGE_TYPE_ORDER.filter((t) => !uploadedTypesInOrder.includes(t));
  return [...uploadedTypesInOrder, ...remaining];
}

let cachedManifest: ImageManifest | null = null;
let cachedAt = 0;
let inFlight: Promise<ImageManifest> | null = null;
const CACHE_TTL_MS = 15000;

function invalidateCache() {
  cachedManifest = null;
  cachedAt = 0;
}

function notifyUpdated() {
  invalidateCache();
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MANIFEST_UPDATED_EVENT));
}

interface ProductImageRow {
  product_slug: string;
  image_type: ProductImageType;
  storage_path: string;
  display_order: number;
  updated_at: string;
}

async function fetchManifestFromSupabase(): Promise<ImageManifest> {
  const supabase = createClient();
  if (!supabase) return readLocalManifest();

  const { data, error } = await supabase
    .from("product_images")
    .select("product_slug, image_type, storage_path, display_order, updated_at")
    .order("product_slug", { ascending: true })
    .order("display_order", { ascending: true });

  if (error || !data) return readLocalManifest();

  const images: Record<string, Partial<Record<ProductImageType, ManifestEntry>>> = {};
  const uploadedOrderBySlug: Record<string, ProductImageType[]> = {};

  for (const row of data as ProductImageRow[]) {
    const slug = row.product_slug;
    images[slug] ??= {};
    images[slug][row.image_type] = {
      path: row.storage_path,
      version: new Date(row.updated_at).getTime(),
      updatedAt: row.updated_at,
    };
    uploadedOrderBySlug[slug] ??= [];
    uploadedOrderBySlug[slug].push(row.image_type);
  }

  const manifest: ImageManifest = {};
  for (const slug of Object.keys(images)) {
    manifest[slug] = {
      images: images[slug],
      order: mergeOrder(uploadedOrderBySlug[slug] ?? []),
    };
  }
  return manifest;
}

/**
 * Returns the full manifest (every product with at least one uploaded
 * image). Requests are cached briefly and de-duplicated so a grid of many
 * ProductCards mounting at once doesn't fire one query per card.
 */
export async function getManifest(): Promise<ImageManifest> {
  const supabase = createClient();
  if (!supabase) return readLocalManifest();

  const now = Date.now();
  if (cachedManifest && now - cachedAt < CACHE_TTL_MS) {
    return cachedManifest;
  }
  if (inFlight) return inFlight;

  inFlight = fetchManifestFromSupabase()
    .then((manifest) => {
      cachedManifest = manifest;
      cachedAt = Date.now();
      inFlight = null;
      return manifest;
    })
    .catch(() => {
      inFlight = null;
      return readLocalManifest();
    });

  return inFlight;
}

export async function getManifestEntry(
  slug: string,
  type: ProductImageType
): Promise<ManifestEntry | undefined> {
  const manifest = await getManifest();
  return manifest[slug]?.images?.[type];
}

export async function getImageOrder(slug: string): Promise<ProductImageType[]> {
  const manifest = await getManifest();
  return manifest[slug]?.order ?? PRODUCT_IMAGE_TYPE_ORDER;
}

/**
 * Records that `type` now points at `path` for `slug` — call right after a
 * successful Storage upload. Writing to `product_images` requires an
 * authenticated admin; the table's RLS policies enforce that regardless of
 * what this function is told to do, so a non-admin call fails safely with
 * an error rather than silently succeeding.
 */
export async function setManifestEntry(
  slug: string,
  type: ProductImageType,
  path: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  let error: string | null = null;

  if (supabase) {
    const order = await getImageOrder(slug);
    const displayOrder = order.includes(type) ? order.indexOf(type) : order.length;

    const { error: upsertError } = await supabase.from("product_images").upsert(
      {
        product_slug: slug,
        image_type: type,
        storage_path: path,
        display_order: displayOrder,
      },
      { onConflict: "product_slug,image_type" }
    );
    error = upsertError?.message ?? null;
  }

  // Local fallback mirror — also the only record when Supabase is off.
  const manifest = readLocalManifest();
  const existing = manifest[slug]?.images?.[type];
  manifest[slug] = {
    order: manifest[slug]?.order ?? PRODUCT_IMAGE_TYPE_ORDER,
    images: {
      ...manifest[slug]?.images,
      [type]: { path, version: (existing?.version ?? 0) + 1, updatedAt: new Date().toISOString() },
    },
  };
  writeLocalManifest(manifest);
  notifyUpdated();

  return { error: supabase ? error : null };
}

/** Removes an uploaded image's record — the storefront falls back to the
 *  placeholder for that type immediately after. */
export async function removeManifestEntry(
  slug: string,
  type: ProductImageType
): Promise<{ error: string | null }> {
  const supabase = createClient();
  let error: string | null = null;

  if (supabase) {
    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_slug", slug)
      .eq("image_type", type);
    error = deleteError?.message ?? null;
  }

  const manifest = readLocalManifest();
  if (manifest[slug]) {
    const nextImages = { ...manifest[slug].images };
    delete nextImages[type];
    manifest[slug] = { ...manifest[slug], images: nextImages };
  }
  writeLocalManifest(manifest);
  notifyUpdated();

  return { error: supabase ? error : null };
}

/** Moves one uploaded image type earlier (-1) or later (+1) among the
 *  product's other uploaded images. No-ops for a type that hasn't been
 *  uploaded yet — there's nothing meaningful to reorder. */
export async function reorderImage(
  slug: string,
  type: ProductImageType,
  direction: -1 | 1
): Promise<{ error: string | null }> {
  const manifest = await getManifest();
  const slugManifest = manifest[slug];
  const uploadedOrder = (slugManifest?.order ?? PRODUCT_IMAGE_TYPE_ORDER).filter(
    (t) => slugManifest?.images?.[t]
  );

  const from = uploadedOrder.indexOf(type);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= uploadedOrder.length) {
    return { error: null };
  }

  const nextUploadedOrder = [...uploadedOrder];
  [nextUploadedOrder[from], nextUploadedOrder[to]] = [nextUploadedOrder[to], nextUploadedOrder[from]];

  const supabase = createClient();
  let error: string | null = null;

  if (supabase) {
    const results = await Promise.all(
      nextUploadedOrder.map((t, index) =>
        supabase
          .from("product_images")
          .update({ display_order: index })
          .eq("product_slug", slug)
          .eq("image_type", t)
      )
    );
    error = results.find((r) => r.error)?.error?.message ?? null;
  }

  const local = readLocalManifest();
  local[slug] = {
    images: local[slug]?.images ?? {},
    order: mergeOrder(nextUploadedOrder),
  };
  writeLocalManifest(local);
  notifyUpdated();

  return { error: supabase ? error : null };
}
