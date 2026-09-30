"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const { signIn, signUp, isConfigured } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        router.push("/account");
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
      } else {
        setInfo("Account created. Check your email to confirm, then sign in.");
      }
    }
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isConfigured && (
        <p className="border border-rose bg-rose-pale/40 px-4 py-3 text-xs text-ink">
          This store is running in demo mode — connect a Supabase project (see the
          README) to enable real account creation and sign-in.
        </p>
      )}

      {mode === "register" && (
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wide text-taupe">Full Name</span>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-line bg-transparent px-3 py-3 text-sm focus:outline-none focus:border-ink"
          />
        </label>
      )}

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-wide text-taupe">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line bg-transparent px-3 py-3 text-sm focus:outline-none focus:border-ink"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-wide text-taupe">Password</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line bg-transparent px-3 py-3 text-sm focus:outline-none focus:border-ink"
        />
      </label>

      {error && <p className="text-xs text-rose-deep">{error}</p>}
      {info && <p className="text-xs text-taupe">{info}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
      </Button>
    </form>
  );
}
