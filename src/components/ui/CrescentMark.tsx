import { cn } from "@/lib/utils";

interface CrescentMarkProps {
  className?: string;
  spin?: boolean;
}

/**
 * The LUNE signature mark — a waning crescent, used as the logomark,
 * a section divider, and (spinning) as the loading indicator.
 */
export function CrescentMark({ className, spin = false }: CrescentMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-4 w-4", spin && "animate-crescentSpin", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.5 4.5C14.5 6 10 11.4 10 17.6c0 6.2 4.5 11.4 10.5 12.9C10.9 31.4 3 24.5 3 16S10.9.6 20.5 4.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Four-phase moon divider used to break up sections with intent. */
export function MoonPhaseDivider({ className }: { className?: string }) {
  const phases = [1, 0.66, 0.33, 0.08];
  return (
    <div className={cn("flex items-center gap-2", className)} aria-hidden="true">
      {phases.map((p, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink"
          style={{ opacity: p }}
        />
      ))}
    </div>
  );
}
