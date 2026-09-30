"use client";

import { useMemo, useState } from "react";
import { Product, BodyMeasurements, FitPreference, SizeRecommendationResult, FIT_PREFERENCES } from "@/lib/types";
import { recommendSize } from "@/lib/size-recommendation";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CrescentMark } from "@/components/ui/CrescentMark";
import { cn } from "@/lib/utils";

interface SizeFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSelectSize: (size: string) => void;
}

type FormState = {
  height: string;
  weight: string;
  bust: string;
  waist: string;
  hip: string;
};

const EMPTY_FORM: FormState = { height: "", weight: "", bust: "", waist: "", hip: "" };

const FIELD_RANGES: Record<keyof FormState, { min: number; max: number; label: string }> = {
  height: { min: 130, max: 210, label: "Height" },
  weight: { min: 30, max: 160, label: "Weight" },
  bust: { min: 60, max: 150, label: "Bust" },
  waist: { min: 50, max: 140, label: "Waist" },
  hip: { min: 60, max: 150, label: "Hip" },
};

export function SizeFinderModal({ isOpen, onClose, product, onSelectSize }: SizeFinderModalProps) {
  const { user, sizeProfile, saveSizeProfile } = useAuth();
  const [form, setForm] = useState<FormState>(() =>
    sizeProfile
      ? {
          height: String(sizeProfile.height),
          weight: String(sizeProfile.weight),
          bust: String(sizeProfile.bust),
          waist: String(sizeProfile.waist),
          hip: String(sizeProfile.hip),
        }
      : EMPTY_FORM
  );
  const [fitPreference, setFitPreference] = useState<FitPreference>(sizeProfile?.fitPreference ?? "regular");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [result, setResult] = useState<SizeRecommendationResult | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  function updateField(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleClose() {
    onClose();
    // Reset to the results/form the user last saw only after the closing
    // transition — avoids a visible flash back to the empty form.
    setTimeout(() => {
      setResult(null);
      setSaveState("idle");
    }, 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    (Object.keys(form) as (keyof FormState)[]).forEach((key) => {
      const raw = form[key];
      const value = Number(raw);
      const range = FIELD_RANGES[key];
      if (!raw || Number.isNaN(value)) {
        nextErrors[key] = "Required";
      } else if (value < range.min || value > range.max) {
        nextErrors[key] = `${range.min}–${range.max} ${key === "weight" ? "kg" : "cm"}`;
      }
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const measurements: BodyMeasurements = {
      height: Number(form.height),
      weight: Number(form.weight),
      bust: Number(form.bust),
      waist: Number(form.waist),
      hip: Number(form.hip),
      fitPreference,
    };

    setResult(recommendSize(measurements, product.sizeChart));
    setSaveState("idle");
  }

  async function handleSaveProfile() {
    const value = Number.isNaN(Number(form.height)) ? null : form;
    if (!value) return;
    setSaveState("saving");
    const { error } = await saveSizeProfile({
      height: Number(form.height),
      weight: Number(form.weight),
      bust: Number(form.bust),
      waist: Number(form.waist),
      hip: Number(form.hip),
      fitPreference,
    });
    if (error) {
      setSaveError(error);
      setSaveState("error");
    } else {
      setSaveState("saved");
    }
  }

  const availableSizes = useMemo(
    () => new Set(product.sizes.filter((s) => s.inStock).map((s) => s.size)),
    [product.sizes]
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} label={`Find your size for ${product.name}`} maxWidthClassName="max-w-xl">
      <div className="flex items-center justify-between border-b border-line px-6 py-5">
        <span className="flex items-center gap-2 font-display text-lg">
          <CrescentMark className="h-4 w-4 text-rose-deep" />
          Find My Size
        </span>
        <button aria-label="Close" onClick={handleClose} className="text-2xl leading-none">
          ×
        </button>
      </div>

      <div className="flex-1 px-6 py-6">
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-taupe">
              Tell us your measurements and we&apos;ll compare them against the actual size chart
              for <span className="text-ink">{product.name}</span> — not a generic chart.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Height (cm)"
                value={form.height}
                onChange={(v) => updateField("height", v)}
                error={errors.height}
              />
              <NumberField
                label="Weight (kg)"
                value={form.weight}
                onChange={(v) => updateField("weight", v)}
                error={errors.weight}
              />
              <NumberField
                label="Bust (cm)"
                value={form.bust}
                onChange={(v) => updateField("bust", v)}
                error={errors.bust}
              />
              <NumberField
                label="Waist (cm)"
                value={form.waist}
                onChange={(v) => updateField("waist", v)}
                error={errors.waist}
              />
              <NumberField
                label="Hip (cm)"
                value={form.hip}
                onChange={(v) => updateField("hip", v)}
                error={errors.hip}
                className="col-span-2 sm:col-span-1"
              />
            </div>

            <div>
              <p className="mb-3 text-xs uppercase tracking-widest2 text-taupe">Preferred Fit</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {FIT_PREFERENCES.map((fit) => (
                  <button
                    type="button"
                    key={fit.value}
                    onClick={() => setFitPreference(fit.value)}
                    className={cn(
                      "border px-3 py-3 text-left transition-colors",
                      fitPreference === fit.value
                        ? "border-ink bg-ink text-ivory"
                        : "border-line text-ink hover:border-ink"
                    )}
                  >
                    <span className="block text-xs uppercase tracking-wide">{fit.label}</span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[11px]",
                        fitPreference === fit.value ? "text-ivory/70" : "text-taupe"
                      )}
                    >
                      {fit.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
              See My Recommendation
            </Button>
          </form>
        ) : (
          <ResultView
            result={result}
            product={product}
            availableSizes={availableSizes}
            onUseSize={(size) => {
              onSelectSize(size);
              handleClose();
            }}
            onRecalculate={() => setResult(null)}
            canSave={Boolean(user)}
            saveState={saveState}
            saveError={saveError}
            onSaveProfile={handleSaveProfile}
          />
        )}
      </div>
    </Modal>
  );
}

function NumberField({
  label,
  value,
  onChange,
  error,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs uppercase tracking-wide text-taupe">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line bg-transparent px-3 py-3 text-sm focus:outline-none focus:border-ink"
      />
      {error && <span className="mt-1 block text-xs text-rose-deep">{error}</span>}
    </label>
  );
}

function ResultView({
  result,
  product,
  availableSizes,
  onUseSize,
  onRecalculate,
  canSave,
  saveState,
  saveError,
  onSaveProfile,
}: {
  result: SizeRecommendationResult;
  product: Product;
  availableSizes: Set<string>;
  onUseSize: (size: string) => void;
  onRecalculate: () => void;
  canSave: boolean;
  saveState: "idle" | "saving" | "saved" | "error";
  saveError: string | null;
  onSaveProfile: () => void;
}) {
  const recommendedInStock = availableSizes.has(result.recommendedSize);

  return (
    <div className="animate-fadeUp">
      <div className="border border-line bg-cream/60 px-6 py-8 text-center">
        <p className="eyebrow text-taupe">Your Recommended Size</p>
        <p className="mt-3 font-display text-6xl">{result.recommendedSize}</p>
        <p className="mt-2 text-sm font-medium text-rose-deep">{result.matchPercent}% MATCH</p>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-taupe">
          &ldquo;{result.explanation}&rdquo;
        </p>
        {!recommendedInStock && (
          <p className="mt-3 text-xs text-rose-deep">
            This size is currently out of stock — see how the others fit below.
          </p>
        )}
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs uppercase tracking-widest2 text-taupe">How each size compares</p>
        <ul className="divide-y divide-line border-y border-line">
          {result.breakdown.map((row) => {
            const inStock = availableSizes.has(row.size);
            const isRecommended = row.size === result.recommendedSize;
            return (
              <li
                key={row.size}
                className={cn(
                  "flex items-center justify-between py-3 px-1",
                  isRecommended && "bg-rose-pale/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("w-8 font-display text-lg", !inStock && "text-taupe/50")}>
                    {row.size}
                  </span>
                  <span className={cn("text-xs uppercase tracking-wide", isRecommended ? "text-rose-deep" : "text-taupe")}>
                    {row.fitLabel}
                  </span>
                  {!inStock && <span className="text-[10px] uppercase text-taupe/60">Out of stock</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs tabular-nums text-taupe">{row.matchPercent}%</span>
                  <button
                    disabled={!inStock}
                    onClick={() => onUseSize(row.size)}
                    className="text-[11px] uppercase tracking-wide text-ink underline decoration-line underline-offset-4 hover:decoration-ink disabled:cursor-not-allowed disabled:text-taupe/40 disabled:no-underline"
                  >
                    Use This Size
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => onUseSize(result.recommendedSize)}
          disabled={!recommendedInStock}
          size="lg"
          className="flex-1"
        >
          Use Size {result.recommendedSize}
        </Button>
        <Button variant="outline" size="lg" onClick={onRecalculate}>
          Recalculate
        </Button>
      </div>

      <div className="mt-6 border-t border-line pt-6 text-center">
        {canSave ? (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSaveProfile}
              disabled={saveState === "saving" || saveState === "saved"}
            >
              {saveState === "saved" ? "Saved to My Size Profile ✓" : saveState === "saving" ? "Saving…" : "Save These Measurements"}
            </Button>
            {saveState === "error" && saveError && (
              <p className="mt-2 text-xs text-rose-deep">{saveError}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-taupe">
            <a href="/account/login" className="text-ink hover-underline">
              Sign in
            </a>{" "}
            to save these measurements to your profile for next time.
          </p>
        )}
      </div>
    </div>
  );
}
