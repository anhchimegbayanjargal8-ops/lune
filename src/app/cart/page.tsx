"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatMNT } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { ButtonLink, Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CartPage() {
  const { lines, removeItem, updateQuantity, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const shipping = lines.length === 0 || subtotal >= SITE.freeShippingThreshold ? 0 : 8000;
  const total = subtotal + shipping;

  function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoCode) return;
    setPromoMessage("That code isn't valid — but keep an eye on your inbox for the next one.");
  }

  return (
    <div className="pb-24">
      <PageHeader
        title="Your Bag"
        crumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
      />

      <div className="container-lune">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-taupe">Your bag is empty.</p>
            <ButtonLink href="/shop" variant="primary">
              Continue Shopping
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
            <ul className="divide-y divide-line border-t border-line">
              {lines.map((line) => (
                <li
                  key={`${line.productId}-${line.size}-${line.color}`}
                  className="flex gap-5 py-6"
                >
                  <Link href={`/product/${line.slug}`} className="relative h-36 w-28 shrink-0 bg-cream">
                    <Image src={line.image} alt={line.name} fill sizes="112px" className="object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/product/${line.slug}`} className="font-display text-lg">
                          {line.name}
                        </Link>
                        <p className="mt-1 text-xs text-taupe">
                          {line.color} / {line.size}
                        </p>
                      </div>
                      <span className="text-sm">{formatMNT(line.price * line.quantity)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-line">
                        <button
                          className="h-9 w-9 hover:bg-cream"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(line.productId, line.size, line.color, line.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="w-9 text-center text-sm tabular-nums">{line.quantity}</span>
                        <button
                          className="h-9 w-9 hover:bg-cream"
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(line.productId, line.size, line.color, line.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-xs uppercase tracking-wide text-taupe hover:text-ink"
                        onClick={() => removeItem(line.productId, line.size, line.color)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit border border-line p-6">
              <h2 className="font-display text-xl">Order Summary</h2>

              <form onSubmit={applyPromo} className="mt-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full border border-line bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
                />
                <Button type="submit" variant="outline" size="sm">
                  Apply
                </Button>
              </form>
              {promoMessage && <p className="mt-2 text-xs text-taupe">{promoMessage}</p>}

              <div className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-taupe">Subtotal</span>
                  <span>{formatMNT(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-taupe">Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatMNT(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
                  <span>Total</span>
                  <span>{formatMNT(total)}</span>
                </div>
              </div>

              <ButtonLink href="/checkout" variant="primary" className="mt-6 w-full">
                Proceed to Checkout
              </ButtonLink>
              <p className="mt-3 text-center text-[11px] text-taupe">
                Taxes included where applicable. Shipping calculated above.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
