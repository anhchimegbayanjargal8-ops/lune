import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-taupe">No pieces found in this selection just yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-fadeUp"
          style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
        >
          <ProductCard product={product} priority={i < 4} />
        </div>
      ))}
    </div>
  );
}
