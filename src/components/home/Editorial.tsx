import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { CrescentMark } from "@/components/ui/CrescentMark";

export function Editorial() {
  return (
    <section className="container-lune grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
        <Image
          src="https://picsum.photos/seed/lune-editorial-atelier/1000/1250"
          alt="LUNE atelier in Ulaanbaatar"
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="max-w-md">
        <CrescentMark className="h-6 w-6 text-rose-deep" />
        <h2 className="mt-6 text-3xl font-display font-medium leading-tight sm:text-4xl">
          Designed close to home, worn close to the skin.
        </h2>
        <p className="mt-5 leading-relaxed text-taupe">
          LUNE began in a small studio near Sükhbaatar Square with a simple
          idea: clothing that survives a Mongolian winter without sacrificing
          the clean, considered lines we love in Korean and Scandinavian
          design. Every fabric is chosen twice — once for how it looks, and
          once for how it wears at −20°C.
        </p>
        <ButtonLink href="/about" variant="outline" size="md" className="mt-8">
          Our Story
        </ButtonLink>
      </div>
    </section>
  );
}
