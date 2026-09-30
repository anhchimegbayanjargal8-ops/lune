import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as Mongolian Tugrik, e.g. 128000 -> "128,000₮"
 */
export function formatMNT(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US").format(Math.round(amount));
  return `${formatted}₮`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max).trim()}…` : value;
}
