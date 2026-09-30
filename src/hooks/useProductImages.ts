"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { ProductImage, PRODUCT_IMAGE_TYPE_LABEL, getStorageImageUrl } from "@/lib/product-images";
import { getManifest, MANIFEST_UPDATED_EVENT } from "@/lib/admin/image-manifest";

/**
 * Returns a product's gallery with any admin-uploaded images (from the
 * Supabase `product_images` table — see src/lib/admin/image-manifest.ts)
 * swapped in over the base (placeholder/override) set, in the admin's
 * chosen order. Falls back to `product.images` untouched whenever nothing
 * has been uploaded — so this never introduces a broken image.
 *
 * Runs client-side only (via useEffect) so server-rendered markup always
 * matches the initial placeholder set first, then upgrades in place —
 * avoiding any hydration mismatch.
 */
export function useProductImages(product: Product): ProductImage[] {
  const [images, setImages] = useState<ProductImage[]>(product.images);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      const manifest = await getManifest();
      const slugManifest = manifest[product.slug];
      if (!slugManifest) {
        if (!cancelled) setImages(product.images);
        return;
      }

      const baseByType = new Map(product.images.map((img) => [img.type, img]));
      const resolved = slugManifest.order
        .map((type) => {
          const entry = slugManifest.images?.[type];
          const base = baseByType.get(type);
          if (entry) {
            const storageUrl = getStorageImageUrl(entry.path);
            if (storageUrl) {
              return {
                type,
                url: `${storageUrl}?v=${entry.version}`,
                alt: base?.alt ?? `${product.name} — ${PRODUCT_IMAGE_TYPE_LABEL[type]}`,
              };
            }
          }
          return base ?? null;
        })
        .filter((img): img is ProductImage => img !== null);

      if (!cancelled) setImages(resolved);
    }

    resolve();
    window.addEventListener(MANIFEST_UPDATED_EVENT, resolve);
    return () => {
      cancelled = true;
      window.removeEventListener(MANIFEST_UPDATED_EVENT, resolve);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  return images;
}
