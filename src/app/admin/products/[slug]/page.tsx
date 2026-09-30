import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import { formatMNT } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { ProductImageManager } from "@/components/admin/ProductImageManager";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function AdminProductDetailPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title={product.name}
        description="Manage this product's photography. Uploads appear on the live product page automatically."
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: product.name },
        ]}
      />

      <div className="mb-8 flex flex-wrap items-center gap-4 border border-line p-4 text-sm">
        <span className="text-taupe">
          {product.category} · {formatMNT(product.price)}
        </span>
        <span className="text-taupe">Slug: {product.slug}</span>
        <ButtonLink href={`/product/${product.slug}`} variant="ghost" size="sm" className="ml-auto">
          View Live Page
        </ButtonLink>
      </div>

      <h2 className="mb-4 font-display text-xl">Product Images</h2>
      <ProductImageManager product={product} />
    </div>
  );
}
