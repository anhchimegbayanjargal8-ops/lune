"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { SizeChartTable } from "@/components/product/SizeChartTable";
import { SizeFinderModal } from "@/components/product/SizeFinderModal";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

export function PurchasePanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isFinderOpen, setIsFinderOpen] = useState(false);

  const hasSizeChart = product.sizeChart.length > 0;
  const selectedSizeInfo = product.sizes.find((s) => s.size === size);

  const handleAddToCart = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    addItem(product, size, color, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div>
      <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />

      {/* Color */}
      <div className="mt-8">
        <p className="mb-3 text-xs uppercase tracking-widest2 text-taupe">
          Colour — <span className="text-ink">{color}</span>
        </p>
        <div className="flex gap-2">
          {product.colors.map((c) => (
            <button
              key={c.name}
              aria-label={c.name}
              onClick={() => setColor(c.name)}
              className={cn(
                "h-9 w-9 rounded-full border transition-all",
                color === c.name ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory" : "border-line"
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest2 text-taupe">
            Size {size && <span className="text-ink">— {size}</span>}
          </p>
          {hasSizeChart && (
            <button
              onClick={() => setIsChartOpen((v) => !v)}
              className="text-xs text-taupe hover-underline"
            >
              {isChartOpen ? "Hide Size Chart" : "Size Chart"}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s.size}
              disabled={!s.inStock}
              onClick={() => {
                setSize(s.size);
                setSizeError(false);
              }}
              className={cn(
                "flex h-11 min-w-11 items-center justify-center border px-3 text-xs uppercase transition-colors",
                !s.inStock && "cursor-not-allowed border-line text-taupe/40 line-through",
                s.inStock && size === s.size && "border-ink bg-ink text-ivory",
                s.inStock && size !== s.size && "border-line text-ink hover:border-ink"
              )}
            >
              {s.size}
            </button>
          ))}
        </div>
        {sizeError && <p className="mt-2 text-xs text-rose-deep">Please select a size to continue.</p>}

        {selectedSizeInfo?.inStock && (
          <p className="mt-2 text-xs text-taupe">
            {selectedSizeInfo.stockQuantity <= 3
              ? `Only ${selectedSizeInfo.stockQuantity} left in size ${selectedSizeInfo.size}`
              : "In stock"}
          </p>
        )}

        {isChartOpen && hasSizeChart && (
          <div className="mt-4 animate-fadeUp border border-line p-4">
            <SizeChartTable chart={product.sizeChart} />
          </div>
        )}

        {hasSizeChart && (
          <button
            onClick={() => setIsFinderOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 border border-ink py-3.5 text-xs uppercase tracking-widest2 text-ink transition-colors duration-300 ease-lune hover:bg-ink hover:text-ivory"
          >
            Find My Size
          </button>
        )}
      </div>

      {/* Quantity + Add to cart */}
      <div className="mt-8 flex items-center gap-4">
        <QuantitySelector quantity={quantity} onChange={setQuantity} />
        <Button onClick={handleAddToCart} className="flex-1" size="lg">
          {justAdded ? "Added to Bag ✓" : "Add to Bag"}
        </Button>
      </div>

      <p className="mt-4 text-xs text-taupe">
        Free shipping in Ulaanbaatar on orders over 150,000₮. Cash on delivery available nationwide.
      </p>

      {hasSizeChart && (
        <SizeFinderModal
          isOpen={isFinderOpen}
          onClose={() => setIsFinderOpen(false)}
          product={product}
          onSelectSize={(recommendedSize) => {
            setSize(recommendedSize);
            setSizeError(false);
          }}
        />
      )}
    </div>
  );
}
