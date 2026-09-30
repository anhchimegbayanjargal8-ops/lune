"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatMNT } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { CrescentMark } from "@/components/ui/CrescentMark";

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  addressLine: string;
  note: string;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  phone: "",
  email: "",
  city: "Ulaanbaatar",
  district: "",
  addressLine: "",
  note: "",
};

export default function CheckoutPage() {
  const { lines, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [payment, setPayment] = useState<"cod" | "card">("cod");
  const [orderId, setOrderId] = useState<string | null>(null);

  const shipping = subtotal >= SITE.freeShippingThreshold || subtotal === 0 ? 0 : 8000;
  const total = subtotal + shipping;

  const requiredFields: (keyof FormState)[] = [
    "fullName",
    "phone",
    "city",
    "district",
    "addressLine",
  ];

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    requiredFields.forEach((field) => {
      if (!form[field].trim()) nextErrors[field] = "Required";
    });
    if (form.phone && !/^[0-9+\s-]{7,15}$/.test(form.phone)) {
      nextErrors.phone = "Enter a valid phone number";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const id = `LUNE-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(id);
    clearCart();
  }

  if (orderId) {
    return <OrderConfirmation orderId={orderId} name={form.fullName} total={total} />;
  }

  if (lines.length === 0) {
    return (
      <div className="container-lune py-24 text-center">
        <p className="text-taupe">Your bag is empty — add something you love first.</p>
        <ButtonLink href="/shop" variant="primary" className="mt-6">
          Continue Shopping
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        title="Checkout"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <div className="container-lune grid gap-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-10">
          <section>
            <h2 className="mb-5 font-display text-xl">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full Name"
                value={form.fullName}
                onChange={(v) => updateField("fullName", v)}
                error={errors.fullName}
              />
              <Field
                label="Phone Number"
                value={form.phone}
                onChange={(v) => updateField("phone", v)}
                error={errors.phone}
                placeholder="99112233"
              />
              <Field
                label="Email (optional)"
                value={form.email}
                onChange={(v) => updateField("email", v)}
                type="email"
                className="sm:col-span-2"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-5 font-display text-xl">Delivery Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="City"
                value={form.city}
                onChange={(v) => updateField("city", v)}
                error={errors.city}
              />
              <Field
                label="District"
                value={form.district}
                onChange={(v) => updateField("district", v)}
                error={errors.district}
                placeholder="Khan-Uul"
              />
              <Field
                label="Address"
                value={form.addressLine}
                onChange={(v) => updateField("addressLine", v)}
                error={errors.addressLine}
                placeholder="Apartment, street, building no."
                className="sm:col-span-2"
              />
              <Field
                label="Delivery Note (optional)"
                value={form.note}
                onChange={(v) => updateField("note", v)}
                className="sm:col-span-2"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-5 font-display text-xl">Payment</h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 border border-line p-4">
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium">Cash on Delivery</span>
                  <span className="block text-xs text-taupe">
                    Pay in cash when your order arrives.
                  </span>
                </span>
              </label>
              <label className="flex cursor-not-allowed items-start gap-3 border border-line p-4 opacity-50">
                <input type="radio" name="payment" disabled className="mt-1" />
                <span>
                  <span className="block text-sm font-medium">Credit / Debit Card</span>
                  <span className="block text-xs text-taupe">
                    Card payments are coming soon.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <Button type="submit" size="lg" className="w-full">
            Place Order — {formatMNT(total)}
          </Button>
        </form>

        <aside className="h-fit border border-line p-6">
          <h2 className="font-display text-xl">Order Summary</h2>
          <ul className="mt-5 space-y-4 border-t border-line pt-5">
            {lines.map((line) => (
              <li key={`${line.productId}-${line.size}-${line.color}`} className="flex justify-between text-sm">
                <span className="text-taupe">
                  {line.name} ({line.color}/{line.size}) × {line.quantity}
                </span>
                <span>{formatMNT(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
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
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs uppercase tracking-wide text-taupe">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line bg-transparent px-3 py-3 text-sm focus:outline-none focus:border-ink"
      />
      {error && <span className="mt-1 block text-xs text-rose-deep">{error}</span>}
    </label>
  );
}

function OrderConfirmation({
  orderId,
  name,
  total,
}: {
  orderId: string;
  name: string;
  total: number;
}) {
  return (
    <div className="container-lune flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <CrescentMark className="h-8 w-8 text-rose-deep" />
      <h1 className="mt-6 text-3xl font-display font-medium sm:text-4xl">
        Thank you{name ? `, ${name.split(" ")[0]}` : ""}.
      </h1>
      <p className="mt-3 max-w-md text-taupe">
        Your order <span className="text-ink">{orderId}</span> has been placed for{" "}
        {formatMNT(total)}, payable by cash on delivery. We&apos;ll reach out to confirm delivery
        details shortly.
      </p>
      <div className="mt-8 flex gap-4">
        <ButtonLink href="/shop" variant="outline">
          Continue Shopping
        </ButtonLink>
        <ButtonLink href="/account" variant="primary">
          View Orders
        </ButtonLink>
      </div>
    </div>
  );
}
