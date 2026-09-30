"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getAllProductsWithSource } from "@/lib/products";
import { Product } from "@/lib/types";
import { formatMNT } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { getManifest, MANIFEST_UPDATED_EVENT } from "@/lib/admin/image-manifest";
import { PRODUCT_IMAGE_TYPE_ORDER } from "@/lib/product-images";
import { SeedProductsPanel } from "@/components/admin/SeedProductsPanel";
import { CrescentMark } from "@/components/ui/CrescentMark";

type LoadState = "loading" | "ready" | "error";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [source, setSource] = useState<"supabase" | "mock" | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadCounts, setUploadCounts] = useState<Record<string, number>>({});

  const loadProducts = useCallback(async () => {
    setLoadState("loading");
    setLoadError(null);
    try {
      const { products, source } = await getAllProductsWithSource();
      setProducts(products);
      setSource(source);
      setLoadState("ready");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Couldn't load products.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (products.length === 0) return;
    async function refresh() {
      const manifest = await getManifest();
      const counts: Record<string, number> = {};
      for (const product of products) {
        counts[product.slug] = Object.keys(manifest[product.slug]?.images ?? {}).length;
      }
      setUploadCounts(counts);
    }
    refresh();
    window.addEventListener(MANIFEST_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MANIFEST_UPDATED_EVENT, refresh);
  }, [products]);

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Products"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Products" }]}
      />

      <div className="mb-10">
        <SeedProductsPanel onDone={loadProducts} />
      </div>

      {loadState === "loading" && (
        <div className="flex items-center justify-center gap-3 border-y border-line py-16 text-taupe">
          <CrescentMark spin className="h-4 w-4" />
          Loading products…
        </div>
      )}

      {loadState === "error" && (
        <div className="border border-rose bg-rose-pale/40 px-4 py-6 text-center text-sm text-ink">
          <p>Couldn&apos;t load products: {loadError}</p>
          <button
            onClick={loadProducts}
            className="mt-3 text-[11px] uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            Retry
          </button>
        </div>
      )}

      {loadState === "ready" && products.length === 0 && (
        <p className="border-y border-line py-16 text-center text-sm text-taupe">
          No products found yet — seed the catalog above to get started.
        </p>
      )}

      {loadState === "ready" && products.length > 0 && (
        <>
          {source === "mock" && (
            <p className="mb-4 text-xs text-taupe">
              Showing built-in mock data — Supabase has no products yet (seed above) or isn&apos;t
              reachable right now.
            </p>
          )}
          <ul className="divide-y divide-line border-y border-line">
            {products.map((product) => {
              const uploaded = uploadCounts[product.slug] ?? 0;
              const total = PRODUCT_IMAGE_TYPE_ORDER.length;
              const cover = product.images[0];
              return (
                <li key={product.id} className="flex items-center gap-4 py-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-cream">
                    {cover && (
                      <Image
                        src={cover.url}
                        alt={cover.alt}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{product.name}</p>
                    <p className="text-xs text-taupe">
                      {product.category} · {formatMNT(product.price)}
                    </p>
                  </div>
                  <span className="hidden text-xs text-taupe sm:inline">
                    {uploaded}/{total} images uploaded
                  </span>
                  <Link
                    href={`/admin/products/${product.slug}`}
                    className="shrink-0 border border-ink px-3 py-2 text-[11px] uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-ivory"
                  >
                    Manage Images
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
