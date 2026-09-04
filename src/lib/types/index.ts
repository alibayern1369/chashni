// =============================================================================
// CHASHNI — Type System (DB-Ready)
// =============================================================================
// Types that align with the Supabase database schema.
// Kept backward-compatible with existing UI components where possible.
// =============================================================================

// ─── Database Types (generated from schema) ──────────────────────────────────

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: Tenant;
        Insert: Omit<Tenant, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Tenant, "id" | "created_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      tenant_members: {
        Row: TenantMember;
        Insert: Omit<TenantMember, "id" | "created_at">;
        Update: Partial<Omit<TenantMember, "id" | "created_at">>;
      };
      categories: {
        Row: DBCategory;
        Insert: Omit<DBCategory, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DBCategory, "id" | "created_at">>;
      };
      menu_items: {
        Row: DBMenuItem;
        Insert: Omit<DBMenuItem, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DBMenuItem, "id" | "created_at">>;
      };
      burger_components: {
        Row: BurgerComponent;
        Insert: Omit<BurgerComponent, "id" | "created_at">;
        Update: Partial<Omit<BurgerComponent, "id" | "created_at">>;
      };
      tables: {
        Row: DBTable;
        Insert: Omit<DBTable, "id" | "created_at">;
        Update: Partial<Omit<DBTable, "id" | "created_at">>;
      };
      orders: {
        Row: DBOrder;
        Insert: Omit<DBOrder, "id" | "order_number" | "created_at" | "updated_at">;
        Update: Partial<Omit<DBOrder, "id" | "order_number" | "created_at">>;
      };
      tenant_settings: {
        Row: TenantSetting;
        Insert: Omit<TenantSetting, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<TenantSetting, "id" | "created_at">>;
      };
      pages: {
        Row: Page;
        Insert: Omit<Page, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Page, "id" | "created_at">>;
      };
      page_blocks: {
        Row: PageBlock;
        Insert: Omit<PageBlock, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PageBlock, "id" | "created_at">>;
      };
      media: {
        Row: Media;
        Insert: Omit<Media, "id" | "created_at">;
        Update: Partial<Omit<Media, "id" | "created_at">>;
      };
      promotions: {
        Row: Promotion;
        Insert: Omit<Promotion, "id" | "created_at">;
        Update: Partial<Omit<Promotion, "id" | "created_at">>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id" | "created_at">;
        Update: Record<string, never>;
      };
      search_history: {
        Row: SearchHistory;
        Insert: Omit<SearchHistory, "id" | "created_at">;
        Update: Record<string, never>;
      };
    };
  };
}

// ─── Core Entity Types ───────────────────────────────────────────────────────

export type Locale = "fa" | "en";

export type UserRole = "super_admin" | "restaurant_admin" | "kitchen_staff" | "customer";

export type TenantMemberRole = "owner" | "admin" | "staff" | "kitchen";

export type DBOrderStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

// UI-facing order status (kept backward-compatible with existing components)
export type OrderStatus = "received" | "preparing" | "ready" | "completed";

// UI-facing order types (kept backward-compatible with existing components)
export type OrderType = "dine-in" | "takeaway";

// Full DB order type
export type DBOrderType = "dine-in" | "takeaway" | "delivery";

export type BurgerComponentCategory = "bun" | "patty" | "cheese" | "toppings" | "sauce";

export type PageBlockType =
  | "hero"
  | "text"
  | "image"
  | "gallery"
  | "features"
  | "testimonials"
  | "cta"
  | "menu_highlight"
  | "custom_html";

export type PromotionDiscountType = "percentage" | "fixed";

// ─── Database Row Types ──────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  slug: string;
  name_fa: string;
  name_en: string;
  slogan_fa: string | null;
  slogan_en: string | null;
  phone: string | null;
  address_fa: string | null;
  address_en: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  timezone: string;
  currency: string;
  enabled_modules: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: TenantMemberRole;
  is_active: boolean;
  created_at: string;
}

export interface DBCategory {
  id: string;
  tenant_id: string;
  slug: string;
  name_fa: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBMenuItem {
  id: string;
  tenant_id: string;
  category_id: string;
  slug: string;
  name_fa: string;
  name_en: string;
  desc_fa: string | null;
  desc_en: string | null;
  base_price: number;
  image: string | null;
  calories: number;
  rating: number;
  review_count: number;
  preparation_time: number;
  spicy_level: number;
  is_vegetarian: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_chef_pick: boolean;
  ingredients: LocalizedString[];
  allergens: LocalizedString[];
  options: OptionGroup[];
  extras: Extra[];
  available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BurgerComponent {
  id: string;
  tenant_id: string;
  category: BurgerComponentCategory;
  component_id: string;
  name_fa: string;
  name_en: string;
  price: number;
  calories: number;
  sort_order: number;
  is_available: boolean;
  created_at: string;
}

export interface DBTable {
  id: string;
  tenant_id: string;
  number: number;
  name: string | null;
  capacity: number;
  qr_token: string;
  is_active: boolean;
  created_at: string;
}

export interface DBOrder {
  id: string;
  tenant_id: string;
  order_number: number;
  user_id: string | null;
  table_id: string | null;
  status: DBOrderStatus;
  order_type: DBOrderType;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TenantSetting {
  id: string;
  tenant_id: string;
  key: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  tenant_id: string;
  slug: string;
  title_fa: string;
  title_en: string;
  description_fa: string | null;
  description_en: string | null;
  is_published: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageBlock {
  id: string;
  page_id: string;
  type: PageBlockType;
  content: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  tenant_id: string | null;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  tenant_id: string;
  code: string;
  description_fa: string | null;
  description_en: string | null;
  discount_type: PromotionDiscountType;
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  menu_item_id: string;
  tenant_id: string;
  created_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  tenant_id: string;
  query: string;
  created_at: string;
}

// ─── Nested / Sub-types ──────────────────────────────────────────────────────

export interface LocalizedString {
  fa: string;
  en: string;
}

export interface OptionItem {
  id: string;
  nameFa: string;
  nameEn: string;
  priceModifier: number;
}

export interface OptionGroup {
  id: string;
  nameFa: string;
  nameEn: string;
  type: "radio" | "checkbox";
  required: boolean;
  options: OptionItem[];
}

export interface Extra {
  id: string;
  nameFa: string;
  nameEn: string;
  price: number;
  calories?: number;
}

export interface OrderItemSnapshot {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions?: Record<string, string[]>;
  selectedExtras?: string[];
  customBurger?: CustomBurger;
  note?: string;
}

export interface CustomBurger {
  name?: string;
  bun: string;
  patty: string;
  cheese: string[];
  toppings: string[];
  sauce: string[];
}

// ─── UI Types (backward-compatible with existing components) ─────────────────

export interface Category {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  descFa: string;
  descEn: string;
  categorySlug: string;
  basePrice: number;
  image: string;
  calories: number;
  rating: number;
  reviewCount: number;
  preparationTime: number;
  spicyLevel: number;
  isVegetarian: boolean;
  isBestseller: boolean;
  isNew: boolean;
  isChefPick: boolean;
  ingredients: string[];
  ingredientsFa: string[];
  allergens: string[];
  allergensFa: string[];
  options: OptionGroup[];
  extras: Extra[];
  available: boolean;
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
  selectedOptions: Record<string, string[]>;
  selectedExtras: string[];
  note?: string;
  customBurger?: CustomBurger;
}

export interface CartState {
  items: CartItem[];
  table?: string;
  orderType: OrderType;
}

export interface Order {
  id: string;
  items: CartItem[];
  table?: string;
  orderType: OrderType;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface FilterOptions {
  vegetarian: boolean;
  spicy: boolean;
  bestseller: boolean;
  chefPick: boolean;
  isNew: boolean;
  maxPrice?: number;
}

export interface Branch {
  id: string;
  nameFa: string;
  nameEn: string;
  addressFa: string;
  addressEn: string;
}

export interface Restaurant {
  nameFa: string;
  nameEn: string;
  sloganFa: string;
  sloganEn: string;
  addressFa: string;
  addressEn: string;
  phone: string;
  branches: Branch[];
  hours: { open: string; close: string };
}

export interface RestaurantSettings {
  nameFa: string;
  nameEn: string;
  sloganFa: string;
  sloganEn: string;
  addressFa: string;
  addressEn: string;
  phone: string;
  hours: { open: string; close: string };
  designerName: string;
  designerUrl: string;
  logoEmoji: string;
}

export interface BurgerOption {
  id: string;
  nameFa: string;
  nameEn: string;
  price: number;
  calories: number;
}

export interface BurgerCategory {
  id: string;
  nameFa: string;
  nameEn: string;
  options: BurgerOption[];
}

// ─── Helper Types ────────────────────────────────────────────────────────────

export type ModuleName = "menu" | "orders" | "tables" | "delivery" | "payment" | "loyalty" | "cms" | "reservations";

export interface TenantContext {
  tenant: Tenant;
  settings: Record<string, unknown>;
  modules: ModuleName[];
}

// ─── Conversion Helpers ──────────────────────────────────────────────────────

export function dbCategoryToUI(cat: DBCategory): Category {
  return {
    id: cat.id,
    slug: cat.slug,
    nameFa: cat.name_fa,
    nameEn: cat.name_en,
    icon: cat.icon ?? undefined,
  };
}

export function dbMenuItemToUI(item: DBMenuItem, categorySlug: string): MenuItem {
  return {
    id: item.id,
    slug: item.slug,
    nameFa: item.name_fa,
    nameEn: item.name_en,
    descFa: item.desc_fa ?? "",
    descEn: item.desc_en ?? "",
    categorySlug,
    basePrice: item.base_price,
    image: item.image ?? "",
    calories: item.calories,
    rating: item.rating,
    reviewCount: item.review_count,
    preparationTime: item.preparation_time,
    spicyLevel: item.spicy_level,
    isVegetarian: item.is_vegetarian,
    isBestseller: item.is_bestseller,
    isNew: item.is_new,
    isChefPick: item.is_chef_pick,
    ingredients: item.ingredients.map((i) => i.en),
    ingredientsFa: item.ingredients.map((i) => i.fa),
    allergens: item.allergens.map((i) => i.en),
    allergensFa: item.allergens.map((i) => i.fa),
    options: item.options,
    extras: item.extras,
    available: item.available,
  };
}

export function uiMenuItemToDB(
  item: MenuItem,
  tenantId: string,
  categoryId: string,
): Omit<DBMenuItem, "id" | "created_at" | "updated_at"> {
  return {
    tenant_id: tenantId,
    category_id: categoryId,
    slug: item.slug,
    name_fa: item.nameFa,
    name_en: item.nameEn,
    desc_fa: item.descFa,
    desc_en: item.descEn,
    base_price: item.basePrice,
    image: item.image,
    calories: item.calories,
    rating: item.rating,
    review_count: item.reviewCount,
    preparation_time: item.preparationTime,
    spicy_level: item.spicyLevel,
    is_vegetarian: item.isVegetarian,
    is_bestseller: item.isBestseller,
    is_new: item.isNew,
    is_chef_pick: item.isChefPick,
    ingredients: item.ingredientsFa.map((fa, i) => ({
      fa,
      en: item.ingredients[i] ?? "",
    })),
    allergens: item.allergensFa.map((fa, i) => ({
      fa,
      en: item.allergens[i] ?? "",
    })),
    options: item.options,
    extras: item.extras,
    available: item.available,
    sort_order: 0,
  };
}
