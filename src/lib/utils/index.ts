import { clsx, type ClassValue } from "clsx";
import type { CartItem, Locale, MenuItem } from "../types";

export function cn(...classes: ClassValue[]): string {
  return clsx(...classes);
}

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function formatPersianNumber(num: number): string {
  return num.toString().replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d)]);
}

export function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d)]);
}

export function formatPrice(price: number, locale: Locale): string {
  const formatted = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(price);
  if (locale === "fa") {
    return `${toPersianDigits(formatted)} تومان`;
  }
  return `${formatted} Toman`;
}

export function calculateItemPrice(item: CartItem, menuItems: MenuItem[]): number {
  const menuItem = menuItems.find((m) => m.id === item.menuItemId);
  if (!menuItem) return 0;

  let price = menuItem.basePrice;

  for (const [groupId, optionIds] of Object.entries(item.selectedOptions)) {
    const group = menuItem.options.find((g) => g.id === groupId);
    if (!group) continue;
    for (const optionId of optionIds) {
      const option = group.options.find((o) => o.id === optionId);
      if (option) price += option.priceModifier;
    }
  }

  for (const extraId of item.selectedExtras) {
    const extra = menuItem.extras.find((e) => e.id === extraId);
    if (extra) price += extra.price;
  }

  return price * item.quantity;
}

export function calculateCartTotal(
  items: CartItem[],
  menuItems: MenuItem[]
): { subtotal: number; discount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + calculateItemPrice(item, menuItems), 0);
  const discount = 0;
  return { subtotal, discount, total: subtotal - discount };
}

const SPICY_LABELS: Record<Locale, string[]> = {
  fa: ["", "🌶", "🌶🌶", "🌶🌶🌶"],
  en: ["", "Mild", "Medium", "Hot"],
};

export function getSpicyLabel(level: number, locale: Locale): string {
  return SPICY_LABELS[locale][Math.min(level, 3)] ?? "";
}

export function getEstimatedTime(items: CartItem[], menuItems: MenuItem[]): number {
  if (items.length === 0) return 0;
  return Math.max(
    ...items.map((item) => {
      const mi = menuItems.find((m) => m.id === item.menuItemId);
      return mi?.preparationTime ?? 0;
    })
  );
}

export function generateOrderId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
