import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { CATEGORIES } from "@/lib/constants";
import { ProductGalleryConnected } from "@/components/product/ProductGalleryConnected";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { SizeChartTable } from "@/components/product/SizeChartTable";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: `${product.name} — LUNE`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const category = CATEGORIES.find((c) => c.slug === product.category);
  const related = await getRelatedProducts(product);

  return (
    <div className="pb-20">
      <nav className="container-lune flex flex-wrap items-center gap-2 py-6 text-[11px] uppercase tracking-widest2 text-taupe">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/categories/${category.slug}`} className="hover:text-ink">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="container-lune grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGalleryConnected product={product} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2">
            {product.isNew && <Badge variant="dark">New</Badge>}
            {product.compareAtPrice && <Badge variant="rose">Sale</Badge>}
          </div>
          <h1 className="mt-4 text-3xl font-display font-medium sm:text-4xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-taupe">
            <StarRating rating={product.rating} />
            <span>
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          <p className="mt-6 leading-relaxed text-taupe">{product.description}</p>

          <div className="mt-8">
            <PurchasePanel product={product} />
          </div>

          <div className="mt-10">
            <Accordion
              items={[
                {
                  title: "Material & Details",
                  defaultOpen: true,
                  children: (
                    <div className="space-y-3">
                      <p>
                        <span className="text-ink">Material:</span> {product.material}
                      </p>
                      <ul className="list-inside list-disc space-y-1.5">
                        {product.details.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ),
                },
                {
                  title: "Care Instructions",
                  children: (
                    <ul className="list-inside list-disc space-y-1.5">
                      {product.careInstructions.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  ),
                },
                ...(product.sizeChart.length > 0
                  ? [
                      {
                        title: "Size Chart",
                        children: <SizeChartTable chart={product.sizeChart} />,
                      },
                    ]
                  : []),
                {
                  title: "Shipping & Returns",
                  children: (
                    <p>
                      Orders within Ulaanbaatar arrive in 1–2 business days; nationwide
                      delivery takes 3–5 business days. Returns are accepted within 14 days
                      of delivery, unworn and with tags attached.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex text-rose-deep" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < Math.round(rating) ? "★" : "☆"}</span>
      ))}
    </div>
  );
}
