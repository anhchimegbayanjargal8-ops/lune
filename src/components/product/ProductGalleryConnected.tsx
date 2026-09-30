"use client";

import { Product } from "@/lib/types";
import { useProductImages } from "@/hooks/useProductImages";
import { ProductGallery } from "./ProductGallery";

/**
 * Wires admin-uploaded images (see src/lib/admin/image-manifest.ts) into
 * the product detail page without touching ProductGallery itself — it
 * still receives a plain `images` + `name` prop exactly as before, just
 * resolved to include any uploads.
 */
export function ProductGalleryConnected({ product }: { product: Product }) {
  const images = useProductImages(product);
  return <ProductGallery images={images} name={product.name} />;
}
