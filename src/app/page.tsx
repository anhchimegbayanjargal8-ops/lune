import { Hero } from "@/components/home/Hero";
import { MarqueeStrip } from "@/components/home/MarqueeStrip";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Editorial } from "@/components/home/Editorial";
import { PromoBanner } from "@/components/home/PromoBanner";
import { NewArrivalsPreview } from "@/components/home/NewArrivalsPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <CategoryShowcase />
      <FeaturedProducts />
      <Editorial />
      <NewArrivalsPreview />
      <PromoBanner />
    </>
  );
}
