import { cn } from "@/lib/utils";
import { CrescentMark } from "./CrescentMark";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="eyebrow flex items-center gap-2 text-rose-deep">
          <CrescentMark className="h-3 w-3" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-display font-medium tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-taupe leading-relaxed">{description}</p>
      )}
    </div>
  );
}
