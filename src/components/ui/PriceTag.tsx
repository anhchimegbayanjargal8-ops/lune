import { formatMNT } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceTagProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
};

export function PriceTag({ price, compareAtPrice, size = "md", className }: PriceTagProps) {
  const onSale = compareAtPrice && compareAtPrice > price;
  return (
    <div className={cn("flex items-baseline gap-2", sizeClasses[size], className)}>
      <span className={cn(onSale && "text-rose-deep")}>{formatMNT(price)}</span>
      {onSale && (
        <span className="text-taupe line-through text-[0.85em]">
          {formatMNT(compareAtPrice!)}
        </span>
      )}
    </div>
  );
}
