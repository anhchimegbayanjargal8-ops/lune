import { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/account/AuthForm";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Create Account — LUNE",
};

export default function RegisterPage() {
  return (
    <div className="pb-24">
      <PageHeader
        title="Create Account"
        crumbs={[{ label: "Home", href: "/" }, { label: "Create Account" }]}
      />
      <div className="container-lune max-w-md">
        <AuthForm mode="register" />
        <p className="mt-6 text-center text-sm text-taupe">
          Already have an account?{" "}
          <Link href="/account/login" className="text-ink hover-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
