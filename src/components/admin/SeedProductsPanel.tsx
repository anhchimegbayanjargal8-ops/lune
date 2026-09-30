"use client";

import { useCallback, useEffect, useState } from "react";
import { PRODUCTS } from "@/lib/mock-data";
import { seedProductsFromMockData, SeedResult } from "@/lib/admin/seed-products";
import { getSupabaseProductsCount } from "@/lib/products";
import { Button } from "@/components/ui/Button";
import { CrescentMark } from "@/components/ui/CrescentMark";

interface SeedProductsPanelProps {
  onDone?: () => void;
}

const TOTAL_MOCK_PRODUCTS = PRODUCTS.length;

type CheckState = "checking" | "ready" | "not-configured" | "error";

export function SeedProductsPanel({ onDone }: SeedProductsPanelProps) {
  const [checkState, setCheckState] = useState<CheckState>("checking");
  const [supabaseCount, setSupabaseCount] = useState<number | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const [seedStatus, setSeedStatus] = useState<"idle" | "seeding" | "done">("idle");
  const [result, setResult] = useState<SeedResult | null>(null);

  const refreshCount = useCallback(async () => {
    setCheckState("checking");
    setCheckError(null);
    const { count, isConfigured, error } = await getSupabaseProductsCount();
    if (!isConfigured) {
      setCheckState("not-configured");
      return;
    }
    if (error) {
      setCheckError(error);
      setCheckState("error");
      return;
    }
    setSupabaseCount(count ?? 0);
    setCheckState("ready");
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  async function handleSeed() {
    setSeedStatus("seeding");
    const seedResult = await seedProductsFromMockData();
    setResult(seedResult);
    setSeedStatus("done");
    await refreshCount();
    onDone?.();
  }

  const isSynced = checkState === "ready" && supabaseCount !== null && supabaseCount >= TOTAL_MOCK_PRODUCTS;

  return (
    <div className="border border-line p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl">Seed Products from Mock Data</h2>
        {checkState === "checking" ? (
          <span className="flex items-center gap-2 text-xs text-taupe">
            <CrescentMark spin className="h-3.5 w-3.5" />
            Checking Supabase…
          </span>
        ) : checkState === "ready" ? (
          <span className="text-xs text-taupe">
            {supabaseCount} of {TOTAL_MOCK_PRODUCTS} products in Supabase
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-taupe">
        Imports all {TOTAL_MOCK_PRODUCTS} built-in products (and their categories and
        size/colour variants) into Supabase. Safe to run more than once — existing rows are
        updated in place by slug, never duplicated.
      </p>

      {checkState === "not-configured" && (
        <p className="mt-4 border border-rose bg-rose-pale/40 px-4 py-3 text-xs text-ink">
          Supabase isn&apos;t connected yet — add your project URL and anon key first (see
          SUPABASE_SETUP.md), then reload this page.
        </p>
      )}

      {checkState === "error" && (
        <div className="mt-4 border border-rose bg-rose-pale/40 px-4 py-3 text-xs text-ink">
          <p>Couldn&apos;t check Supabase: {checkError}</p>
          <button
            onClick={refreshCount}
            className="mt-2 text-[11px] uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            Retry
          </button>
        </div>
      )}

      {checkState === "ready" && isSynced && seedStatus !== "done" && (
        <p className="mt-4 border border-line bg-cream/60 px-4 py-3 text-sm text-ink">
          ✓ All products are already synced.
        </p>
      )}

      {checkState === "ready" && (
        <Button
          onClick={handleSeed}
          disabled={seedStatus === "seeding"}
          variant={isSynced ? "outline" : "primary"}
          size={isSynced ? "sm" : "md"}
          className="mt-4"
        >
          {seedStatus === "seeding" ? "Seeding…" : isSynced ? "Seed Again" : "Seed Products"}
        </Button>
      )}

      {result && seedStatus === "done" && (
        <div className="mt-5 border-t border-line pt-5 text-sm">
          {result.errors.length === 0 ? (
            <p className="text-ink">
              Done — {result.categoriesUpserted} categories, {result.productsUpserted} products,{" "}
              {result.variantsUpserted} variants upserted.
            </p>
          ) : (
            <div>
              <p className="text-rose-deep">
                Finished with {result.errors.length} error{result.errors.length > 1 ? "s" : ""}:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-taupe">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
              <Button variant="outline" size="sm" onClick={handleSeed} className="mt-4">
                Retry
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
