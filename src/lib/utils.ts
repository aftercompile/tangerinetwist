import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRCompact(amount: number) {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(amount % 10_000_000 === 0 ? 0 : 1)}Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(amount % 100_000 === 0 ? 0 : 1)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}k`;
  return formatINR(amount);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
