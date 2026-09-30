import { BodyMeasurements, FitPreference, SizeMeasurement, SizeRecommendationResult } from "./types";

/**
 * Target garment "ease" (how much bigger the garment is than the body, in cm)
 * for each fit preference. These are added on top of the customer's raw body
 * measurement to get the garment measurement we'd expect them to be happiest in.
 */
const EASE_BY_FIT: Record<FitPreference, number> = {
  fitted: 1,
  regular: 5,
  relaxed: 9,
  oversized: 14,
};

const FIT_PREFERENCE_LABEL: Record<FitPreference, string> = {
  fitted: "fitted",
  regular: "regular",
  relaxed: "relaxed",
  oversized: "oversized",
};

/** Relative weight given to each measurement when scoring a size. */
const WEIGHTS = { bust: 0.35, waist: 0.3, hip: 0.2, length: 0.15 };

/**
 * Estimates the garment length a customer's height would be most comfortable
 * in. Used as a light secondary signal alongside bust/waist/hip — on its own
 * height/weight are a poor proxy for size, but they help break ties between
 * two sizes that fit the torso equally well.
 */
function estimateIdealLength(heightCm: number): number {
  return heightCm * 0.36;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(99, Math.round(value)));
}

/**
 * Scores a single size-chart row against the customer's measurements and
 * chosen fit preference. Lower deviation = better match. Returns a 0-100
 * match percentage (capped at 99 — no size is ever a "perfect" 100% match,
 * since real bodies never map exactly onto a flat size chart).
 */
function scoreSize(row: SizeMeasurement, measurements: BodyMeasurements): number {
  const ease = EASE_BY_FIT[measurements.fitPreference];
  const idealLength = estimateIdealLength(measurements.height);

  const bustDelta = Math.abs(row.bust - (measurements.bust + ease));
  const waistDelta = Math.abs(row.waist - (measurements.waist + ease));
  const hipDelta = Math.abs(row.hip - (measurements.hip + ease));
  const lengthDelta = Math.abs(row.length - idealLength);

  const weightedDeviation =
    bustDelta * WEIGHTS.bust +
    waistDelta * WEIGHTS.waist +
    hipDelta * WEIGHTS.hip +
    lengthDelta * WEIGHTS.length;

  // ~1cm of weighted deviation costs ~3.5 match points. Tuned so a
  // near-perfect chart match lands around 95-99%, and a size that's off by
  // a couple of sizes drops into the 40-60% range rather than 0.
  return clampPercent(100 - weightedDeviation * 3.5);
}

/**
 * Recommends the best-fitting size for a customer from a product's own size
 * chart — never from height/weight alone. Reusable across every product:
 * pass in that product's `sizeChart` and the customer's measurements.
 */
export function recommendSize(
  measurements: BodyMeasurements,
  sizeChart: SizeMeasurement[]
): SizeRecommendationResult | null {
  if (sizeChart.length === 0) return null;

  const scored = sizeChart.map((row) => ({
    size: row.size,
    matchPercent: scoreSize(row, measurements),
  }));

  const bestIndex = scored.reduce(
    (bestIdx, current, idx) => (current.matchPercent > scored[bestIdx].matchPercent ? idx : bestIdx),
    0
  );

  const breakdown = scored.map((entry, idx) => {
    const offset = idx - bestIndex;
    let fitLabel: string;
    if (offset === 0) fitLabel = "Recommended";
    else if (offset === -1) fitLabel = "More fitted";
    else if (offset <= -2) fitLabel = "Very fitted";
    else if (offset === 1) fitLabel = "Relaxed";
    else fitLabel = "Oversized";

    return { size: entry.size, matchPercent: entry.matchPercent, fitLabel };
  });

  const recommended = scored[bestIndex];
  const fitLabel = FIT_PREFERENCE_LABEL[measurements.fitPreference];

  return {
    recommendedSize: recommended.size,
    matchPercent: recommended.matchPercent,
    fitDescription: `${recommended.matchPercent}% match`,
    explanation: `Size ${recommended.size} should give you a comfortable ${fitLabel} fit based on your measurements.`,
    breakdown,
  };
}
