import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "dark",
  className,
}: {
  children: React.ReactNode;
  variant?: "dark" | "rose" | "outline";
  className?: string;
}) {
  const styles = {
    dark: "bg-ink text-ivory",
    rose: "bg-rose text-ink",
    outline: "border border-ink/30 text-ink",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-widest2 font-medium",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
