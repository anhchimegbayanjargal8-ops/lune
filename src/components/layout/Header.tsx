"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { CrescentMark } from "@/components/ui/CrescentMark";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const isTransparent = isHome && !isScrolled && !isMobileOpen;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-500 ease-lune",
          isTransparent
            ? "bg-transparent text-ivory"
            : "bg-ivory/95 text-ink backdrop-blur-sm border-b border-line"
        )}
      >
        <div className="container-lune flex h-16 items-center justify-between lg:h-20">
          <button
            aria-label="Open menu"
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <span className="h-px w-5 bg-current" />
            <span className="h-px w-5 bg-current" />
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-display font-medium tracking-widest2"
          >
            <CrescentMark className="h-4 w-4" />
            {SITE.name}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "hover-underline text-[13px] uppercase tracking-widest2",
                  pathname === link.href && "opacity-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href={user ? "/account" : "/account/login"}
              aria-label="My account"
              className="hidden text-[13px] uppercase tracking-widest2 hover-underline lg:inline"
            >
              {user ? "Account" : "Sign In"}
            </Link>
            <Link href="/account" aria-label="My account" className="lg:hidden">
              <UserIcon />
            </Link>
            <button
              aria-label={`Cart, ${itemCount} items`}
              onClick={openDrawer}
              className="relative"
            >
              <BagIcon />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-deep text-[10px] font-medium text-ivory">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </>
  );
}

function BagIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8h12l1 13H5L6 8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M9 8V6a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5 20c1.2-3.8 4-5.6 7-5.6s5.8 1.8 7 5.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
