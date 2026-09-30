import { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CrescentMark } from "@/components/ui/CrescentMark";
import { ButtonLink } from "@/components/ui/Button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About — LUNE",
  description: "The story behind LUNE — a quiet, considered fashion house in Ulaanbaatar.",
};

const VALUES = [
  {
    title: "Made for the climate",
    body: "Every fabric is tested against the reality of a Mongolian winter, not just a studio mood board.",
  },
  {
    title: "Small, deliberate runs",
    body: "We produce in limited batches rather than chasing volume — fewer pieces, worn for longer.",
  },
  {
    title: "Honest pricing",
    body: "No markup theatre. Our prices reflect the fabric, the making, and a fair margin — nothing more.",
  },
];

const TIMELINE = [
  { year: "2022", text: "LUNE begins as a two-person studio near Sükhbaatar Square." },
  { year: "2023", text: "First cashmere knitwear run sells out in nine days." },
  { year: "2024", text: "LUNE opens its first fitting studio for made-to-order pieces." },
  { year: "2026", text: "LUNE moves online, bringing the full collection to all of Mongolia." },
];

export default function AboutPage() {
  return (
    <div className="pb-24">
      <PageHeader
        eyebrow="Our Story"
        title="About LUNE"
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="container-lune grid items-center gap-10 py-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream lg:order-2">
          <Image
            src="https://picsum.photos/seed/lune-about-founder/1000/1250"
            alt="LUNE studio, Ulaanbaatar"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="lg:order-1">
          <CrescentMark className="h-6 w-6 text-rose-deep" />
          <h2 className="mt-6 text-3xl font-display font-medium leading-tight sm:text-4xl">
            Clothing that understands where it&apos;s worn.
          </h2>
          <p className="mt-5 leading-relaxed text-taupe">
            {SITE.description} We started LUNE because we couldn&apos;t find
            clothing that felt as considered as the international labels we
            admired, but priced and made for life in Mongolia. So we built it
            ourselves — pattern by pattern, fabric by fabric.
          </p>
          <p className="mt-4 leading-relaxed text-taupe">
            Today, every LUNE piece is designed and sampled in our
            Ulaanbaatar studio before it ever reaches production. We keep
            runs small on purpose — it&apos;s the only way we know to protect
            the quality we promise you.
          </p>
        </div>
      </section>

      <section className="container-lune py-20">
        <SectionHeading eyebrow="What we believe" title="Three things we won't compromise on" align="center" className="mx-auto" />
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="text-center">
              <CrescentMark className="mx-auto h-5 w-5 text-rose-deep" />
              <h3 className="mt-4 font-display text-xl">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-taupe">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream/60 py-20">
        <div className="container-lune">
          <SectionHeading eyebrow="Since 2022" title="How we got here" />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TIMELINE.map((t) => (
              <div key={t.year} className="border-l border-line pl-5">
                <span className="font-display text-2xl text-rose-deep">{t.year}</span>
                <p className="mt-2 text-sm leading-relaxed text-taupe">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-lune flex flex-col items-center gap-5 py-20 text-center">
        <h2 className="max-w-lg text-3xl font-display font-medium sm:text-4xl">
          Come see the studio, or shop the collection online.
        </h2>
        <p className="max-w-md text-taupe">
          {SITE.city} · {SITE.email}
        </p>
        <ButtonLink href="/shop" variant="primary" size="lg">
          Shop the Collection
        </ButtonLink>
      </section>
    </div>
  );
}
