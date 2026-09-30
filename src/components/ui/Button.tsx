import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-ink text-ivory hover:bg-ink-soft",
  secondary: "bg-rose text-ink hover:bg-rose-deep hover:text-ivory",
  outline: "border border-ink text-ink hover:bg-ink hover:text-ivory",
  ghost: "text-ink hover:bg-cream",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3.5 text-xs",
  lg: "px-8 py-4 text-sm",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 uppercase tracking-widest2 font-medium transition-colors duration-300 ease-lune disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap";

interface ButtonProps
  extends BaseProps,
    ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

interface ButtonLinkProps extends BaseProps {
  href: string;
  children: React.ReactNode;
  target?: string;
  onClick?: () => void;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  target,
  onClick,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      target={target}
      onClick={onClick}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </Link>
  );
}
