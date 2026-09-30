import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { MoonPhaseDivider } from "@/components/ui/CrescentMark";

export function Hero() {
  return (
    <section className="relative flex h-[92vh] min-h-[600px] w-full items-end overflow-hidden bg-ink">
      <Image
        src="https://picsum.photos/seed/lune-hero-main/1800/2200"
        alt="LUNE autumn collection — woman in a wool wrap coat"
        fill
        priority
        className="animate-scaleIn object-cover opacity-90"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/20" />

      <div className="container-lune relative z-10 pb-16 text-ivory lg:pb-24">
        <div className="max-w-xl animate-fadeUp" style={{ animationDelay: "200ms" }}>
          <span className="eyebrow text-ivory/70">The Autumn Edit — 2026</span>
          <h1 className="mt-4 text-5xl font-display font-medium leading-[1.05] sm:text-6xl lg:text-7xl">
            Quiet luxury,
            <br />
            everyday.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/80">
            Considered silhouettes and honest fabrics, designed in Ulaanbaatar
            for the way you actually live.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/shop" variant="secondary" size="lg">
              Shop the Edit
            </ButtonLink>
            <ButtonLink
              href="/new-arrivals"
              variant="outline"
              size="lg"
              className="border-ivory text-ivory hover:bg-ivory hover:text-ink"
            >
              New Arrivals
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-6 hidden flex-col items-end gap-3 text-ivory sm:flex lg:right-12">
        <MoonPhaseDivider />
        <span className="text-[10px] uppercase tracking-widest2 text-ivory/60">Scroll</span>
      </div>
    </section>
  );
}
