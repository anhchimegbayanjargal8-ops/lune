import { getNewArrivals } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export async function NewArrivalsPreview() {
  const products = (await getNewArrivals()).slice(0, 4);

  return (
    <section className="container-lune py-20 lg:py-28">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading eyebrow="Just landed" title="New Arrivals" />
        <ButtonLink href="/new-arrivals" variant="outline" size="sm">
          Shop New In
        </ButtonLink>
      </div>
      <div className="mt-12">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
