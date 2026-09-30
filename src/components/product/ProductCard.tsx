"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { PriceTag } from "@/components/ui/PriceTag";
import { Badge } from "@/components/ui/Badge";
import { useProductImages } from "@/hooks/useProductImages";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const images = useProductImages(product);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="img-zoom relative aspect-[4/5] w-full bg-cream">
        <Image
          src={images[0].url}
          alt={images[0].alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover"
          priority={priority}
        />
        {images[1] && (
          <Image
            src={images[1].url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-500 ease-lune group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <Badge variant="dark">New</Badge>}
          {onSale && <Badge variant="rose">Sale</Badge>}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm text-ink transition-colors group-hover:text-taupe">
          {product.name}
        </h3>
        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
      </div>
    </Link>
  );
}
