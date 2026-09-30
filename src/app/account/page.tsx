"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CrescentMark } from "@/components/ui/CrescentMark";
import { SizeProfileForm } from "@/components/account/SizeProfileForm";

export default function AccountPage() {
  const { user, isLoading, isConfigured, signOut } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="container-lune flex min-h-[50vh] items-center justify-center">
        <CrescentMark spin className="h-6 w-6 text-taupe" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pb-24">
        <PageHeader title="My Account" crumbs={[{ label: "Home", href: "/" }, { label: "Account" }]} />
        <div className="container-lune max-w-md text-center">
          {!isConfigured && (
            <p className="mb-6 border border-rose bg-rose-pale/40 px-4 py-3 text-left text-xs text-ink">
              This store is running in demo mode — connect a Supabase project (see the
              README) to enable real accounts.
            </p>
          )}
          <p className="text-taupe">Sign in to view your orders, saved details, and wishlist.</p>
          <div className="mt-6 flex justify-center gap-4">
            <ButtonLink href="/account/login" variant="primary">
              Sign In
            </ButtonLink>
            <ButtonLink href="/account/register" variant="outline">
              Create Account
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const fullName = (user.user_metadata?.full_name as string) || user.email?.split("@")[0];

  return (
    <div className="pb-24">
      <PageHeader
        title={`Welcome back${fullName ? `, ${fullName}` : ""}`}
        crumbs={[{ label: "Home", href: "/" }, { label: "Account" }]}
      />

      <div className="container-lune grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div className="border border-line p-5">
            <p className="text-xs uppercase tracking-wide text-taupe">Signed in as</p>
            <p className="mt-1 truncate text-sm">{user.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            Sign Out
          </Button>
        </aside>

        <div className="space-y-12">
          <section>
            <h2 className="font-display text-2xl">Order History</h2>
            <div className="mt-4 flex flex-col items-start gap-3 border border-dashed border-line p-8">
              <p className="text-sm text-taupe">
                You haven&apos;t placed any orders yet. When you check out, your orders will
                appear here.
              </p>
              <ButtonLink href="/shop" variant="outline" size="sm">
                Start Shopping
              </ButtonLink>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">My Size Profile</h2>
            <p className="mt-1 text-sm text-taupe">
              Your saved measurements, used to pre-fill Find My Size on every product.
            </p>
            <div className="mt-4">
              <SizeProfileForm />
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">Saved Address</h2>
            <div className="mt-4 border border-dashed border-line p-8">
              <p className="text-sm text-taupe">
                No saved addresses yet — add one at checkout to speed up next time.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
