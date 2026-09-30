import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function CategoryShowcase() {
  const featured = CATEGORIES.slice(0, 3);
  return (
    <section className="container-lune py-20 lg:py-28">
      <SectionHeading
        eyebrow="Shop by category"
        title="Six categories, one point of view"
        description="Every piece is designed to move between them — a coat over a slip dress, a knit under a blazer."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {featured.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="img-zoom group relative flex aspect-[3/4] items-end overflow-hidden bg-cream"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="relative z-10 p-6 text-ivory">
              <h3 className="font-display text-2xl">{cat.name}</h3>
              <span className="mt-2 inline-block text-[11px] uppercase tracking-widest2 hover-underline">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/categories" className="hover-underline text-[13px] uppercase tracking-widest2">
          View All Categories
        </Link>
      </div>
    </section>
  );
}
