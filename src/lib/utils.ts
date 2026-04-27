import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPrice(value: number) {
  if (!value && value !== 0) return "---";
  if (value < 0.001) return value.toFixed(8);
  if (value < 0.1) return value.toFixed(6);
  if (value < 2) return value.toFixed(4); // Forex major crosses
  if (value < 100) return value.toFixed(3);
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
