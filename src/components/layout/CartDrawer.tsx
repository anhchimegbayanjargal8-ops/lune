"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { cn, formatMNT } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { SITE } from "@/lib/constants";

export function CartDrawer() {
  const { lines, isDrawerOpen, closeDrawer, removeItem, updateQuantity, subtotal } =
    useCart();

  const freeShippingLeft = Math.max(0, SITE.freeShippingThreshold - subtotal);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-all duration-300 ease-lune",
        isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isDrawerOpen}
    >
      <div
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity duration-300",
          isDrawerOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={closeDrawer}
      />
      <div
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory transition-transform duration-400 ease-lune",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-lg">Your Bag ({lines.length})</h2>
          <button aria-label="Close cart" onClick={closeDrawer} className="text-2xl leading-none">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-taupe">Your bag is empty.</p>
            <ButtonLink href="/shop" variant="outline" size="sm" onClick={closeDrawer}>
              Continue Shopping
            </ButtonLink>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {subtotal < SITE.freeShippingThreshold && (
                <p className="border-b border-line py-4 text-xs text-taupe">
                  Add <span className="text-ink">{formatMNT(freeShippingLeft)}</span> more
                  for free shipping in Ulaanbaatar.
                </p>
              )}
              <ul className="divide-y divide-line">
                {lines.map((line) => (
                  <li key={`${line.productId}-${line.size}-${line.color}`} className="flex gap-4 py-5">
                    <Link
                      href={`/product/${line.slug}`}
                      onClick={closeDrawer}
                      className="relative h-28 w-24 shrink-0 bg-cream"
                    >
                      <Image src={line.image} alt={line.name} fill className="object-cover" sizes="96px" />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/product/${line.slug}`} onClick={closeDrawer} className="text-sm">
                            {line.name}
                          </Link>
                          <button
                            aria-label="Remove item"
                            className="text-taupe hover:text-ink"
                            onClick={() => removeItem(line.productId, line.size, line.color)}
                          >
                            ×
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-taupe">
                          {line.color} / {line.size}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-line">
                          <button
                            className="h-8 w-8 text-sm hover:bg-cream"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              updateQuantity(line.productId, line.size, line.color, line.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-xs tabular-nums">{line.quantity}</span>
                          <button
                            className="h-8 w-8 text-sm hover:bg-cream"
                            aria-label="Increase quantity"
                            onClick={() =>
                              updateQuantity(line.productId, line.size, line.color, line.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm">{formatMNT(line.price * line.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line px-6 py-6">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-taupe">Subtotal</span>
                <span className="font-medium">{formatMNT(subtotal)}</span>
              </div>
              <ButtonLink href="/cart" variant="primary" className="w-full" onClick={closeDrawer}>
                View Bag & Checkout
              </ButtonLink>
              <p className="mt-3 text-center text-[11px] text-taupe">
                Shipping and taxes calculated at checkout.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
