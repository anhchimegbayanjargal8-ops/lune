import { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/account/AuthForm";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Sign In — LUNE",
};

export default function LoginPage() {
  return (
    <div className="pb-24">
      <PageHeader
        title="Sign In"
        crumbs={[{ label: "Home", href: "/" }, { label: "Sign In" }]}
      />
      <div className="container-lune max-w-md">
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-taupe">
          New to LUNE?{" "}
          <Link href="/account/register" className="text-ink hover-underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
