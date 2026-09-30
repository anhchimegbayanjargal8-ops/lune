import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

export function PromoBanner() {
  return (
    <section className="relative flex h-[70vh] min-h-[420px] w-full items-center justify-center overflow-hidden bg-ink">
      <Image
        src="https://picsum.photos/seed/lune-promo-knitwear/1800/1200"
        alt="LUNE knitwear collection"
        fill
        sizes="100vw"
        className="object-cover opacity-70"
      />
      <div className="relative z-10 max-w-lg px-6 text-center text-ivory">
        <span className="eyebrow text-ivory/70">Limited Run</span>
        <h2 className="mt-4 text-4xl font-display font-medium sm:text-5xl">
          Cashmere, before the cold sets in.
        </h2>
        <p className="mt-4 text-sm text-ivory/80">
          Our knitwear edit is cut in small batches — once a colour sells
          through, it doesn&apos;t come back this season.
        </p>
        <ButtonLink href="/categories/knitwear" variant="secondary" size="lg" className="mt-8">
          Shop Knitwear
        </ButtonLink>
      </div>
    </section>
  );
}
