import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
}) {
  return (
    <div className="container-lune pb-8 pt-12 lg:pt-16">
      {crumbs && (
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest2 text-taupe">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              {c.href ? (
                <Link href={c.href} className="hover:text-ink">
                  {c.label}
                </Link>
              ) : (
                <span className="text-ink">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </nav>
      )}
      {eyebrow && <span className="eyebrow text-rose-deep">{eyebrow}</span>}
      <h1 className="mt-3 text-4xl font-display font-medium sm:text-5xl">{title}</h1>
      {description && (
        <p className="mt-3 max-w-xl text-taupe leading-relaxed">{description}</p>
      )}
    </div>
  );
}
