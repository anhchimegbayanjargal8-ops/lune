import { Metadata } from "next";
import { getNewArrivals } from "@/lib/products";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductBrowser } from "@/components/product/ProductBrowser";

export const metadata: Metadata = {
  title: "New Arrivals — LUNE",
  description: "The latest pieces from LUNE, landed this week.",
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Just Landed"
        title="New Arrivals"
        description="Fresh off the pattern table — our newest pieces for the season ahead."
        crumbs={[{ label: "Home", href: "/" }, { label: "New Arrivals" }]}
      />
      <div className="container-lune">
        <ProductBrowser products={products} />
      </div>
    </div>
  );
}
