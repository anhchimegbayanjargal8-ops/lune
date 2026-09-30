import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { getProductsByCategory } from "@/lib/products";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductBrowser } from "@/components/product/ProductBrowser";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const category = CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) return {};
  return {
    title: `${category.name} — LUNE`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.slug);

  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Category"
        title={category.name}
        description={category.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />
      <div className="container-lune">
        <ProductBrowser products={products} showCategoryFilter={false} />
      </div>
    </div>
  );
}
