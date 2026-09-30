import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Categories — LUNE",
  description: "Shop LUNE by category — dresses, outerwear, knitwear, tops, bottoms and accessories.",
};

export default function CategoriesPage() {
  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Browse"
        title="Categories"
        description="Six edits, each built around how the pieces layer together."
        crumbs={[{ label: "Home", href: "/" }, { label: "Categories" }]}
      />
      <div className="container-lune grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="img-zoom group relative flex aspect-[3/4] items-end overflow-hidden bg-cream"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            <div className="relative z-10 p-6 text-ivory">
              <h2 className="font-display text-2xl">{cat.name}</h2>
              <p className="mt-1 max-w-[85%] text-xs text-ivory/80">{cat.description}</p>
              <span className="mt-3 inline-block text-[11px] uppercase tracking-widest2 hover-underline">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
