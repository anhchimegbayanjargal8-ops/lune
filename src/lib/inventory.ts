import { createPublicClient } from "./supabase/public-client";

export interface VariantAvailability {
  /** Whether this exact (product, size, colour) combination exists as a
   *  tracked variant. Always true when Supabase isn't configured/reachable
   *  — see note below. */
  exists: boolean;
  stockQuantity: number;
  available: boolean;
}

/**
 * Looks up real-time stock for one (product, size, colour) combination in
 * `product_variants` — the source of truth for inventory (see
 * supabase/schema.sql). Used right before add-to-cart and again right
 * before checkout completes, so a customer can never buy something that
 * just sold out from under them.
 *
 * `productId` must be the product's real Supabase UUID — pass a mock-data
 * id (when running without Supabase, or before the catalog is seeded) and
 * this intentionally treats the variant as available, trusting the
 * already-resolved stock shown in the UI (`product.sizes[].stockQuantity`,
 * which the caller should already be checking) instead of guessing against
 * a table that this id was never written to.
 */
export async function checkVariantStock(
  productId: string,
  size: string,
  color: string
): Promise<VariantAvailability> {
  const supabase = createPublicClient();
  if (!supabase || !isUuid(productId)) {
    return { exists: true, stockQuantity: Number.POSITIVE_INFINITY, available: true };
  }

  const { data, error } = await supabase
    .from("product_variants")
    .select("stock_quantity")
    .eq("product_id", productId)
    .eq("size", size)
    .eq("color", color)
    .maybeSingle();

  if (error) {
    // Can't verify right now — don't block a purchase over a transient
    // network hiccup; the size button's own inStock flag already gated
    // getting this far.
    return { exists: true, stockQuantity: Number.POSITIVE_INFINITY, available: true };
  }
  if (!data) {
    return { exists: false, stockQuantity: 0, available: false };
  }
  return { exists: true, stockQuantity: data.stock_quantity, available: data.stock_quantity > 0 };
}

/**
 * Checks several cart lines at once (used at checkout) and returns which
 * ones are no longer available, if any.
 */
export async function checkCartStock(
  lines: { productId: string; size: string; color: string; name: string; quantity: number }[]
): Promise<{ line: (typeof lines)[number]; availability: VariantAvailability }[]> {
  const results = await Promise.all(
    lines.map(async (line) => ({
      line,
      availability: await checkVariantStock(line.productId, line.size, line.color),
    }))
  );
  return results.filter(
    (r) => !r.availability.available || r.availability.stockQuantity < r.line.quantity
  );
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
