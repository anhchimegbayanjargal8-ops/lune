import { CategorySlug, Product, ProductVariantOption, SizeMeasurement } from "./types";
import {
  ProductImage,
  ProductImageType,
  PRODUCT_IMAGE_TYPE_ORDER,
  getProductImages,
  getStorageImageUrl,
} from "./product-images";
import { createPublicClient } from "./supabase/public-client";
import { SIZE_RUN } from "./constants";
import * as mockData from "./mock-data";

/**
 * Supabase-first, mock-data-fallback product data layer. Every exported
 * function here has the exact same name/shape as the equivalent in
 * mock-data.ts, so pages just swap their import — no other code needs to
 * change. Falls back to mock-data.ts whenever Supabase isn't configured,
 * the `products` table can't be reached, or it's simply empty (not seeded
 * yet) — the storefront never shows a broken or blank page while waiting
 * on real data.
 */

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  price: number;
  compare_at_price: number | null;
  description: string | null;
  material: string | null;
  details: string[] | null;
  care_instructions: string[] | null;
  colors: { name: string; hex: string }[] | null;
  size_chart: SizeMeasurement[] | null;
  is_new: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  created_at: string;
}

interface VariantRow {
  product_id: string;
  size: string;
  color: string;
  stock_quantity: number;
}

interface ImageRow {
  product_slug: string;
  image_type: ProductImageType;
  storage_path: string;
  display_order: number;
  updated_at: string;
}

/** Merges uploaded photography over the placeholder set for one product —
 *  uploaded shots lead (in the admin's chosen order), un-uploaded types
 *  fall back to placeholder in their default position. Mirrors the same
 *  merge behaviour as src/lib/admin/image-manifest.ts so the gallery order
 *  looks identical whether it was resolved on the server or client. */
function buildImages(slug: string, name: string, uploaded: ImageRow[]): ProductImage[] {
  const base = getProductImages(slug, slug, name);
  const baseByType = new Map(base.map((img) => [img.type, img]));

  const uploadedSorted = [...uploaded].sort((a, b) => a.display_order - b.display_order);
  const uploadedTypes = uploadedSorted.map((u) => u.image_type);
  const remaining = PRODUCT_IMAGE_TYPE_ORDER.filter((t) => !uploadedTypes.includes(t));
  const order = [...uploadedTypes, ...remaining];
  const uploadedByType = new Map(uploadedSorted.map((u) => [u.image_type, u]));

  return order.map((type) => {
    const basePlaceholder = baseByType.get(type)!;
    const uploadedEntry = uploadedByType.get(type);
    if (uploadedEntry) {
      const storageUrl = getStorageImageUrl(uploadedEntry.storage_path);
      if (storageUrl) {
        const version = new Date(uploadedEntry.updated_at).getTime();
        return { type, url: `${storageUrl}?v=${version}`, alt: basePlaceholder.alt };
      }
    }
    return basePlaceholder;
  });
}

function mapRowToProduct(row: ProductRow, variants: VariantRow[], images: ImageRow[]): Product {
  const sizeStockMap = new Map<string, number>();
  let isOneSize = false;
  for (const v of variants) {
    if (v.size === "One Size") isOneSize = true;
    sizeStockMap.set(v.size, (sizeStockMap.get(v.size) ?? 0) + v.stock_quantity);
  }

  const sizes: ProductVariantOption[] = isOneSize
    ? [
        {
          size: "One Size",
          inStock: (sizeStockMap.get("One Size") ?? 0) > 0,
          stockQuantity: sizeStockMap.get("One Size") ?? 0,
        },
      ]
    : SIZE_RUN.map((size) => ({
        size,
        inStock: (sizeStockMap.get(size) ?? 0) > 0,
        stockQuantity: sizeStockMap.get(size) ?? 0,
      }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_slug as CategorySlug,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    currency: "MNT",
    images: buildImages(row.slug, row.name, images),
    colors: row.colors ?? [],
    sizes,
    description: row.description ?? "",
    material: row.material ?? "",
    details: row.details ?? [],
    careInstructions: row.care_instructions ?? [],
    sizeChart: row.size_chart ?? [],
    isNew: row.is_new,
    isFeatured: row.is_featured,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    createdAt: row.created_at,
  };
}

type ProductSource = "supabase" | "mock";

let cachedProducts: Product[] | null = null;
let cachedSource: ProductSource = "mock";
let cachedAt = 0;
let inFlight: Promise<{ products: Product[]; source: ProductSource }> | null = null;
const CACHE_TTL_MS = 10000;

/** Clears the in-memory products cache — call after seeding or any admin
 *  write so the next read reflects the change immediately. */
export function invalidateProductsCache() {
  cachedProducts = null;
  cachedAt = 0;
}

async function fetchAllProductsInternal(
  forceRefresh = false
): Promise<{ products: Product[]; source: ProductSource }> {
  const supabase = createPublicClient();
  if (!supabase) {
    return { products: mockData.getAllProducts(), source: "mock" };
  }

  const now = Date.now();
  if (!forceRefresh && cachedProducts && now - cachedAt < CACHE_TTL_MS) {
    return { products: cachedProducts, source: cachedSource };
  }
  if (inFlight && !forceRefresh) return inFlight;

  inFlight = (async () => {
    try {
      const [{ data: rows, error: rowsError }, { data: variantRows }, { data: imageRows }] =
        await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("product_variants").select("product_id, size, color, stock_quantity"),
          supabase
            .from("product_images")
            .select("product_slug, image_type, storage_path, display_order, updated_at"),
        ]);

      if (rowsError || !rows || rows.length === 0) {
        const result = { products: mockData.getAllProducts(), source: "mock" as const };
        cachedProducts = result.products;
        cachedSource = result.source;
        cachedAt = Date.now();
        return result;
      }

      const variantsByProduct = new Map<string, VariantRow[]>();
      for (const v of (variantRows ?? []) as VariantRow[]) {
        const list = variantsByProduct.get(v.product_id) ?? [];
        list.push(v);
        variantsByProduct.set(v.product_id, list);
      }

      const imagesBySlug = new Map<string, ImageRow[]>();
      for (const img of (imageRows ?? []) as ImageRow[]) {
        const list = imagesBySlug.get(img.product_slug) ?? [];
        list.push(img);
        imagesBySlug.set(img.product_slug, list);
      }

      const products = (rows as ProductRow[]).map((row) =>
        mapRowToProduct(row, variantsByProduct.get(row.id) ?? [], imagesBySlug.get(row.slug) ?? [])
      );

      const result = { products, source: "supabase" as const };
      cachedProducts = result.products;
      cachedSource = result.source;
      cachedAt = Date.now();
      return result;
    } catch {
      return { products: mockData.getAllProducts(), source: "mock" as const };
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export interface ProductsCountResult {
  /** null when Supabase isn't configured, or the count query itself failed. */
  count: number | null;
  isConfigured: boolean;
  error: string | null;
}

/**
 * A cheap, count-only query against `products` (no image/variant joins) —
 * used by the admin seed panel to show "X of 26 products in Supabase"
 * without paying for a full getAllProducts() fetch just for a number.
 */
export async function getSupabaseProductsCount(): Promise<ProductsCountResult> {
  const supabase = createPublicClient();
  if (!supabase) {
    return { count: null, isConfigured: false, error: null };
  }

  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  if (error) {
    return { count: null, isConfigured: true, error: error.message };
  }
  return { count: count ?? 0, isConfigured: true, error: null };
}

export async function getAllProducts(): Promise<Product[]> {
  return (await fetchAllProductsInternal()).products;
}

/** Same as getAllProducts(), but also reports whether the data actually
 *  came from Supabase or fell back to mock data — used by the admin
 *  products list so it's honest about what it's showing. Always bypasses
 *  the cache so the admin view is fresh. */
export async function getAllProductsWithSource(): Promise<{
  products: Product[];
  source: ProductSource;
}> {
  return fetchAllProductsInternal(true);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.isFeatured);
}

export async function getNewArrivals(): Promise<Product[]> {
  const all = await getAllProducts();
  return [...all].filter((p) => p.isNew).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.category === category);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}

/** Simple in-memory search across name, description, material and
 *  category — fine for a catalog this size; swap for Postgres full-text
 *  search (or an external index) if the catalog grows much larger. */
export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await getAllProducts();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q)
  );
}
