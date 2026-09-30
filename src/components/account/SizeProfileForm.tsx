"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FIT_PREFERENCES, FitPreference } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type FormState = { height: string; weight: string; bust: string; waist: string; hip: string };

function toForm(values: { height: number; weight: number; bust: number; waist: number; hip: number } | null): FormState {
  if (!values) return { height: "", weight: "", bust: "", waist: "", hip: "" };
  return {
    height: String(values.height),
    weight: String(values.weight),
    bust: String(values.bust),
    waist: String(values.waist),
    hip: String(values.hip),
  };
}

export function SizeProfileForm() {
  const { sizeProfile, saveSizeProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(!sizeProfile);
  const [form, setForm] = useState<FormState>(toForm(sizeProfile));
  const [fitPreference, setFitPreference] = useState<FitPreference>(sizeProfile?.fitPreference ?? "regular");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const values = {
      height: Number(form.height),
      weight: Number(form.weight),
      bust: Number(form.bust),
      waist: Number(form.waist),
      hip: Number(form.hip),
    };
    if (Object.values(values).some((v) => Number.isNaN(v) || v <= 0)) {
      setError("Please fill in every field with a valid number.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    const { error } = await saveSizeProfile({ ...values, fitPreference });
    if (error) {
      setError(error);
      setStatus("error");
    } else {
      setStatus("idle");
      setError(null);
      setIsEditing(false);
    }
  }

  if (!isEditing && sizeProfile) {
    return (
      <div className="border border-line p-6">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Stat label="Height" value={`${sizeProfile.height} cm`} />
          <Stat label="Weight" value={`${sizeProfile.weight} kg`} />
          <Stat label="Bust" value={`${sizeProfile.bust} cm`} />
          <Stat label="Waist" value={`${sizeProfile.waist} cm`} />
          <Stat label="Hip" value={`${sizeProfile.hip} cm`} />
          <Stat
            label="Preferred Fit"
            value={FIT_PREFERENCES.find((f) => f.value === sizeProfile.fitPreference)?.label ?? sizeProfile.fitPreference}
          />
        </div>
        <Button variant="outline" size="sm" className="mt-6" onClick={() => setIsEditing(true)}>
          Edit Measurements
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="border border-line p-6">
      <p className="mb-5 text-sm text-taupe">
        Save your measurements once, and we&apos;ll pre-fill them every time you use{" "}
        <span className="text-ink">Find My Size</span> on a product.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Height (cm)" value={form.height} onChange={(v) => setForm((f) => ({ ...f, height: v }))} />
        <Field label="Weight (kg)" value={form.weight} onChange={(v) => setForm((f) => ({ ...f, weight: v }))} />
        <Field label="Bust (cm)" value={form.bust} onChange={(v) => setForm((f) => ({ ...f, bust: v }))} />
        <Field label="Waist (cm)" value={form.waist} onChange={(v) => setForm((f) => ({ ...f, waist: v }))} />
        <Field label="Hip (cm)" value={form.hip} onChange={(v) => setForm((f) => ({ ...f, hip: v }))} />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs uppercase tracking-wide text-taupe">Preferred Fit</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FIT_PREFERENCES.map((fit) => (
            <button
              type="button"
              key={fit.value}
              onClick={() => setFitPreference(fit.value)}
              className={cn(
                "border px-3 py-2 text-xs uppercase tracking-wide transition-colors",
                fitPreference === fit.value ? "border-ink bg-ink text-ivory" : "border-line text-ink hover:border-ink"
              )}
            >
              {fit.label}
            </button>
          ))}
        </div>
      </div>

      {status === "error" && error && <p className="mt-4 text-xs text-rose-deep">{error}</p>}

      <div className="mt-6 flex gap-3">
        <Button type="submit" size="sm" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save Measurements"}
        </Button>
        {sizeProfile && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs uppercase tracking-wide text-taupe">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:border-ink"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-taupe">{label}</p>
      <p className="mt-1 text-ink">{value}</p>
    </div>
  );
}
