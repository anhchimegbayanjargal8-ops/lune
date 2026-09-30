import { ProductImage } from "./product-images";

export type CategorySlug =
  | "dresses"
  | "outerwear"
  | "knitwear"
  | "tops"
  | "bottoms"
  | "accessories";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
}

export interface ProductVariantOption {
  size: string;
  inStock: boolean;
  /** Units currently in stock for this size. 0 implies inStock should be false. */
  stockQuantity: number;
}

/** One row of a product's size chart, all measurements in centimetres. */
export interface SizeMeasurement {
  size: string;
  bust: number;
  waist: number;
  hip: number;
  shoulder: number;
  length: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  compareAtPrice?: number;
  currency: "MNT";
  images: ProductImage[];
  colors: { name: string; hex: string }[];
  sizes: ProductVariantOption[];
  description: string;
  material: string;
  details: string[];
  careInstructions: string[];
  sizeChart: SizeMeasurement[];
  isNew: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface Address {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  addressLine: string;
  note?: string;
}

/** ---- Size recommendation ---- */

export type FitPreference = "fitted" | "regular" | "relaxed" | "oversized";

export const FIT_PREFERENCES: { value: FitPreference; label: string; description: string }[] = [
  { value: "fitted", label: "Fitted", description: "Close to the body" },
  { value: "regular", label: "Regular", description: "Comfortable, true to size" },
  { value: "relaxed", label: "Relaxed", description: "Roomy, easy movement" },
  { value: "oversized", label: "Oversized", description: "Deliberately loose" },
];

/** The customer's body measurements used to compute a size recommendation. */
export interface BodyMeasurements {
  height: number; // cm
  weight: number; // kg
  bust: number; // cm
  waist: number; // cm
  hip: number; // cm
  fitPreference: FitPreference;
}

/** How a single size in the chart fits relative to the recommended size. */
export interface SizeFitBreakdown {
  size: string;
  matchPercent: number;
  fitLabel: string;
}

export interface SizeRecommendationResult {
  recommendedSize: string;
  matchPercent: number;
  fitDescription: string;
  explanation: string;
  breakdown: SizeFitBreakdown[];
}

/** A customer's saved measurements — stored on their profile once logged in. */
export interface SizeProfile extends BodyMeasurements {
  updatedAt: string;
}
