/**
 * Canonical module catalog for CHASHNI tenants.
 * Super-admin toggles and UI/API gates must use this list only.
 */

export const MODULE_CATALOG = [
  { id: "menu", labelFa: "منو", labelEn: "Menu", coreDefault: true },
  { id: "orders", labelFa: "سفارش‌ها", labelEn: "Orders", coreDefault: true },
  { id: "tables", labelFa: "میز و QR", labelEn: "Tables & QR", coreDefault: true },
  { id: "builder", labelFa: "ساخت برگر", labelEn: "Burger Builder", coreDefault: true },
  { id: "favorites", labelFa: "علاقه‌مندی‌ها", labelEn: "Favorites", coreDefault: true },
  { id: "cms", labelFa: "لندینگ CMS", labelEn: "CMS Landing", coreDefault: false },
  { id: "payment", labelFa: "پرداخت آنلاین", labelEn: "Online Payment", coreDefault: false },
  { id: "delivery", labelFa: "ارسال", labelEn: "Delivery", coreDefault: false },
  { id: "loyalty", labelFa: "باشگاه مشتریان", labelEn: "Loyalty", coreDefault: false },
  { id: "reservations", labelFa: "رزرو میز", labelEn: "Reservations", coreDefault: false },
  { id: "auth", labelFa: "اجبار ورود برای سفارش", labelEn: "Require Auth to Order", coreDefault: false },
] as const;

export type CatalogModuleId = (typeof MODULE_CATALOG)[number]["id"];

export const ALL_MODULE_IDS: CatalogModuleId[] = MODULE_CATALOG.map((m) => m.id);

export const DEFAULT_ENABLED_MODULES: CatalogModuleId[] = MODULE_CATALOG.filter(
  (m) => m.coreDefault,
).map((m) => m.id);

/** Admin nav path → required module (undefined = always show if member) */
export const ADMIN_NAV_MODULES: Record<string, CatalogModuleId | undefined> = {
  "/admin/menu": "menu",
  "/admin": "orders",
  "/admin/kitchen": "orders",
  "/admin/tables": "tables",
  "/admin/pages": "cms",
  "/admin/promotions": "orders",
  "/admin/media": "menu",
  "/admin/settings": undefined,
  "/admin/reservations": "reservations",
};
