import { PRODUCTS } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { invalidateProductsCache } from "@/lib/products";

export interface SeedResult {
  categoriesUpserted: number;
  productsUpserted: number;
  variantsUpserted: number;
  errors: string[];
}

/**
 * Imports the 26 built-in mock products (src/lib/mock-data.ts) into
 * Supabase. Safe to run more than once: every insert is an `upsert` keyed
 * on a unique column (`slug` for products/categories, `(product_id, size,
 * color)` for variants), so re-running this updates existing rows in place
 * instead of creating duplicates.
 *
 * Runs with the signed-in admin's own browser session — never a
 * service-role key. The underlying `products` / `product_variants` /
 * `categories` tables all have RLS policies that only allow writes from a
 * user listed in `admin_users` (see supabase/schema.sql), so this call
 * fails harmlessly if it's ever invoked by anyone else.
 */
export async function seedProductsFromMockData(): Promise<SeedResult> {
  const result: SeedResult = {
    categoriesUpserted: 0,
    productsUpserted: 0,
    variantsUpserted: 0,
    errors: [],
  };

  const supabase = createClient();
  if (!supabase) {
    result.errors.push("Supabase isn't configured — add your project URL and anon key first.");
    return result;
  }

  // 1. Categories first — products.category_slug has a foreign key
  // against this table, so it must exist before products are inserted.
  const { error: categoriesError } = await supabase.from("categories").upsert(
    CATEGORIES.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.image,
    })),
    { onConflict: "slug" }
  );
  if (categoriesError) {
    result.errors.push(`Categories: ${categoriesError.message}`);
    return result;
  }
  result.categoriesUpserted = CATEGORIES.length;

  // 2. Products.
  const productPayload = PRODUCTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    compare_at_price: p.compareAtPrice ?? null,
    category_slug: p.category,
    material: p.material,
    details: p.details,
    care_instructions: p.careInstructions,
    colors: p.colors,
    size_chart: p.sizeChart,
    is_new: p.isNew,
    is_featured: Boolean(p.isFeatured),
    rating: p.rating,
    review_count: p.reviewCount,
  }));

  const { data: upsertedProducts, error: productsError } = await supabase
    .from("products")
    .upsert(productPayload, { onConflict: "slug" })
    .select("id, slug");

  if (productsError || !upsertedProducts) {
    result.errors.push(`Products: ${productsError?.message ?? "upsert returned no rows"}`);
    return result;
  }
  result.productsUpserted = upsertedProducts.length;

  // 3. Variants — one row per (size, color) combination. Mock data only
  // tracks stock per size (not per color), so every color for a given
  // size starts with that size's mock stockQuantity.
  const idBySlug = new Map(upsertedProducts.map((p) => [p.slug, p.id as string]));
  const variantPayload: { product_id: string; size: string; color: string; stock_quantity: number }[] = [];

  for (const product of PRODUCTS) {
    const productId = idBySlug.get(product.slug);
    if (!productId) continue;
    for (const sizeOption of product.sizes) {
      for (const color of product.colors) {
        variantPayload.push({
          product_id: productId,
          size: sizeOption.size,
          color: color.name,
          stock_quantity: sizeOption.stockQuantity,
        });
      }
    }
  }

  if (variantPayload.length > 0) {
    const { data: upsertedVariants, error: variantsError } = await supabase
      .from("product_variants")
      .upsert(variantPayload, { onConflict: "product_id,size,color" })
      .select("id");

    if (variantsError) {
      result.errors.push(`Variants: ${variantsError.message}`);
    } else {
      result.variantsUpserted = upsertedVariants?.length ?? 0;
    }
  }

  invalidateProductsCache();
  return result;
}
