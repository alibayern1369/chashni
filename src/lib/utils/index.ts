import { clsx, type ClassValue } from "clsx";
import type { CartItem, Locale, MenuItem, CustomBurger } from "../types";
import { CUSTOM_BURGER_BASE_PRICE } from "../types";
import { burgerOptions } from "../data";

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
  const safe = Number.isFinite(price) ? price : 0;
  const formatted = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(safe);
  if (locale === "fa") {
    return `${toPersianDigits(formatted)} تومان`;
  }
  return `${formatted} Toman`;
}

function findBurgerOpt(catId: string, optId: string) {
  const cat = burgerOptions.find((c) => c.id === catId);
  return cat?.options.find((o) => o.id === optId);
}

function asIdList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** Normalize custom burger payloads from cart / localStorage */
export function normalizeCustomBurger(burger: Partial<CustomBurger> | null | undefined): CustomBurger {
  return {
    name: burger?.name,
    bun: typeof burger?.bun === "string" ? burger.bun : "",
    patty: typeof burger?.patty === "string" ? burger.patty : "",
    cheese: asIdList(burger?.cheese),
    toppings: asIdList(burger?.toppings),
    sauce: asIdList(burger?.sauce),
  };
}

export function calculateCustomBurgerPrice(burger: CustomBurger | Partial<CustomBurger>): number {
  const b = normalizeCustomBurger(burger);
  let price = CUSTOM_BURGER_BASE_PRICE;
  const bun = findBurgerOpt("bun", b.bun);
  if (bun) price += bun.price;
  const patty = findBurgerOpt("patty", b.patty);
  if (patty) price += patty.price;
  for (const cheeseId of b.cheese) {
    const opt = findBurgerOpt("cheese", cheeseId);
    if (opt) price += opt.price;
  }
  for (const toppingId of b.toppings) {
    const opt = findBurgerOpt("toppings", toppingId);
    if (opt) price += opt.price;
  }
  for (const sauceId of b.sauce) {
    const opt = findBurgerOpt("sauce", sauceId);
    if (opt) price += opt.price;
  }
  return price;
}

export function calculateCustomBurgerCalories(burger: CustomBurger | Partial<CustomBurger>): number {
  const b = normalizeCustomBurger(burger);
  let cal = 0;
  const bun = findBurgerOpt("bun", b.bun);
  if (bun) cal += bun.calories;
  const patty = findBurgerOpt("patty", b.patty);
  if (patty) cal += patty.calories;
  for (const cheeseId of b.cheese) {
    const opt = findBurgerOpt("cheese", cheeseId);
    if (opt) cal += opt.calories;
  }
  for (const toppingId of b.toppings) {
    const opt = findBurgerOpt("toppings", toppingId);
    if (opt) cal += opt.calories;
  }
  for (const sauceId of b.sauce) {
    const opt = findBurgerOpt("sauce", sauceId);
    if (opt) cal += opt.calories;
  }
  return cal;
}

export function getCustomBurgerName(
  burger: CustomBurger | Partial<CustomBurger> | null | undefined,
  locale: Locale,
): string {
  if (burger?.name) return burger.name;
  return locale === "fa" ? "برگر سفارشی نمکدان" : "Namakdan Custom Burger";
}

export function calculateItemPrice(item: CartItem, menuItems: MenuItem[]): number {
  if (item.menuItemId === "custom-burger") {
    if (!item.customBurger) return CUSTOM_BURGER_BASE_PRICE * item.quantity;
    return calculateCustomBurgerPrice(item.customBurger) * item.quantity;
  }

  const menuItem = menuItems.find((m) => m.id === item.menuItemId);
  if (!menuItem) return 0;

  let price = menuItem.basePrice;

  for (const [groupId, optionIds] of Object.entries(item.selectedOptions || {})) {
    const group = menuItem.options.find((g) => g.id === groupId);
    if (!group) continue;
    for (const optionId of optionIds) {
      const option = group.options.find((o) => o.id === optionId);
      if (option) price += option.priceModifier;
    }
  }

  for (const extraId of item.selectedExtras || []) {
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
      if (item.menuItemId === "custom-burger") return 15;
      const mi = menuItems.find((m) => m.id === item.menuItemId);
      return mi?.preparationTime ?? 0;
    })
  );
}

export function generateOrderId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
