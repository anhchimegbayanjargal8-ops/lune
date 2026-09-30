import { getFeaturedProducts } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="bg-cream/60 py-20 lg:py-28">
      <div className="container-lune">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Editors' picks" title="Wear it now" />
          <ButtonLink href="/shop" variant="outline" size="sm">
            Shop All
          </ButtonLink>
        </div>
        <div className="mt-12">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}
