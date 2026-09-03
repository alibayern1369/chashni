export type Locale = "fa" | "en";

export type OrderStatus = "received" | "preparing" | "ready" | "completed";

export interface Category {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  icon?: string;
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

export interface CustomBurger {
  name?: string;
  bun: string;
  patty: string;
  cheese: string;
  toppings: string[];
  sauce: string;
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
  orderType: "dine-in" | "takeaway";
}

export interface Order {
  id: string;
  items: CartItem[];
  table?: string;
  orderType: "dine-in" | "takeaway";
  status: OrderStatus;
  total: number;
  createdAt: Date;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
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

export interface FilterOptions {
  vegetarian: boolean;
  spicy: boolean;
  bestseller: boolean;
  chefPick: boolean;
  isNew: boolean;
  maxPrice?: number;
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
