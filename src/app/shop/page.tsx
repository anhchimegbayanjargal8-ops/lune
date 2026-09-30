import { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductBrowser } from "@/components/product/ProductBrowser";

export const metadata: Metadata = {
  title: "Shop All — LUNE",
  description: "Browse the full LUNE collection — dresses, outerwear, knitwear and more.",
};

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="The Full Collection"
        title="Shop All"
        description="Every piece, in one place. Filter by category or size to find what you're looking for."
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />
      <div className="container-lune">
        <ProductBrowser products={products} />
      </div>
    </div>
  );
}
