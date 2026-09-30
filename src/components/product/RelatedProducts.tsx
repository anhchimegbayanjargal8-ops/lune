import { Product } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "./ProductGrid";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section className="container-lune border-t border-line py-20">
      <SectionHeading eyebrow="Complete the look" title="You may also like" />
      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
