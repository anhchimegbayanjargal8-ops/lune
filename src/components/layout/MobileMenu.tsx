"use client";

import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { CrescentMark } from "@/components/ui/CrescentMark";

export function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-all duration-300 ease-lune lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      <div
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-[82%] max-w-xs bg-ivory p-8 transition-transform duration-400 ease-lune",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-lg tracking-widest2">
            <CrescentMark className="h-4 w-4" />
            {SITE.name}
          </span>
          <button aria-label="Close menu" onClick={onClose} className="text-2xl leading-none">
            ×
          </button>
        </div>

        <nav className="mt-12 flex flex-col gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-2xl"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-12 border-t border-line pt-6">
          <Link
            href={user ? "/account" : "/account/login"}
            onClick={onClose}
            className="text-[13px] uppercase tracking-widest2"
          >
            {user ? "My Account" : "Sign In / Register"}
          </Link>
        </div>
      </div>
    </div>
  );
}
