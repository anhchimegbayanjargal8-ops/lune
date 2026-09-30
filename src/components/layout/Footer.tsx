"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, NAV_LINKS, SITE } from "@/lib/constants";
import { CrescentMark } from "@/components/ui/CrescentMark";
import { Button } from "@/components/ui/Button";

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <footer className="border-t border-line bg-ivory">
      <div className="container-lune grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:gap-8 lg:py-20">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-xl tracking-widest2">
            <CrescentMark className="h-4 w-4" />
            {SITE.name}
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-taupe">
            {SITE.description}
          </p>
        </div>

        <div>
          <h4 className="eyebrow mb-5">Shop</h4>
          <ul className="space-y-3 text-sm">
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className="hover-underline text-taupe">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-5">Explore</h4>
          <ul className="space-y-3 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover-underline text-taupe">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/account" className="hover-underline text-taupe">
                My Account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-5">Stay in touch</h4>
          <p className="mb-4 text-sm text-taupe">
            New arrivals and quiet sales, once or twice a month.
          </p>
          {submitted ? (
            <p className="text-sm">Thank you — you&apos;re on the list.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-stretch border-b border-ink pb-2">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm placeholder:text-taupe focus:outline-none"
              />
              <Button type="submit" variant="ghost" size="sm" className="px-2 uppercase">
                Join
              </Button>
            </form>
          )}
          <p className="mt-6 text-sm text-taupe">
            {SITE.city}
            <br />
            {SITE.email}
            <br />
            {SITE.phone}
          </p>
        </div>
      </div>

      <div className="border-t border-line py-6">
        <div className="container-lune flex flex-col items-center justify-between gap-3 text-[11px] text-taupe sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Crafted with care in {SITE.city}</p>
        </div>
      </div>
    </footer>
  );
}
