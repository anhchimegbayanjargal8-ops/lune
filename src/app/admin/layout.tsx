import Link from "next/link";
import { CrescentMark } from "@/components/ui/CrescentMark";
import { SITE } from "@/lib/constants";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = {
  title: `Admin — ${SITE.name}`,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: src/middleware.ts already redirects unauthenticated
  // or non-admin visitors before this ever renders. This second check
  // keeps every route under /admin protected even if the middleware
  // matcher configuration ever changes.
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-line">
        <div className="container-lune flex h-16 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 font-display text-lg tracking-widest2">
            <CrescentMark className="h-4 w-4" />
            {SITE.name} <span className="text-taupe">Admin</span>
          </Link>
          <nav className="flex items-center gap-6 text-[13px] uppercase tracking-widest2">
            <Link href="/admin/products" className="hover-underline">
              Products
            </Link>
            <Link href="/" className="hover-underline text-taupe">
              View Storefront
            </Link>
          </nav>
        </div>
      </header>

      <div className="border-b border-line bg-cream/60">
        <p className="container-lune py-2 text-[11px] text-taupe">
          Signed in as <span className="text-ink">{user.email}</span> — access is enforced by
          Supabase Auth plus the <code>admin_users</code> table (Row Level Security).
        </p>
      </div>

      <main className="container-lune py-10">{children}</main>
    </div>
  );
}
