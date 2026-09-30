interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 10,
}: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center border border-line">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="h-11 w-11 text-lg text-ink transition-colors hover:bg-cream disabled:opacity-30"
        disabled={quantity <= min}
        onClick={() => onChange(Math.max(min, quantity - 1))}
      >
        −
      </button>
      <span className="w-10 text-center text-sm tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="h-11 w-11 text-lg text-ink transition-colors hover:bg-cream disabled:opacity-30"
        disabled={quantity >= max}
        onClick={() => onChange(Math.min(max, quantity + 1))}
      >
        +
      </button>
    </div>
  );
}
