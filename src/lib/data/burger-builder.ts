import { BurgerCategory, CUSTOM_BURGER_BASE_PRICE } from "../types";

export { CUSTOM_BURGER_BASE_PRICE };

/**
 * Burger builder catalog for Namakdan.
 * Every option has an explicit price so admin can edit later via burger_components.
 */
export const burgerOptions: BurgerCategory[] = [
  {
    id: "bun",
    nameFa: "نان",
    nameEn: "Bun",
    selectionMode: "single",
    required: true,
    options: [
      { id: "bun-brioche", nameFa: "بریوشه", nameEn: "Brioche", price: 45000, calories: 210, image: null, available: true, sortOrder: 1 },
      { id: "bun-pretzel", nameFa: "پرتزل", nameEn: "Pretzel", price: 60000, calories: 230, image: null, available: true, sortOrder: 2 },
      { id: "bun-sesame", nameFa: "کنجدی", nameEn: "Sesame", price: 42000, calories: 200, image: null, available: true, sortOrder: 3 },
      { id: "bun-whole-wheat", nameFa: "سبوس‌دار", nameEn: "Whole Wheat", price: 55000, calories: 180, image: null, available: true, sortOrder: 4 },
    ],
  },
  {
    id: "patty",
    nameFa: "پتی",
    nameEn: "Patty",
    selectionMode: "single",
    required: true,
    options: [
      { id: "patty-single", nameFa: "سینگل گوشت گوساله", nameEn: "Single Beef", price: 145000, calories: 320, image: null, available: true, sortOrder: 1 },
      { id: "patty-double", nameFa: "دابل گوشت گوساله", nameEn: "Double Beef", price: 210000, calories: 640, image: null, available: true, sortOrder: 2 },
      { id: "patty-chicken", nameFa: "سینه مرغ", nameEn: "Chicken Breast", price: 125000, calories: 250, image: null, available: true, sortOrder: 3 },
      { id: "patty-plant", nameFa: "پتی گیاهی", nameEn: "Plant-based", price: 155000, calories: 220, image: null, available: true, sortOrder: 4 },
    ],
  },
  {
    id: "cheese",
    nameFa: "پنیر",
    nameEn: "Cheese",
    selectionMode: "multi",
    required: true,
    options: [
      { id: "cheese-cheddar", nameFa: "چدار استاندارد", nameEn: "Standard Cheddar", price: 28000, calories: 110, image: null, available: true, sortOrder: 1 },
      { id: "cheese-extra-cheddar", nameFa: "چدار اضافه", nameEn: "Extra Cheddar", price: 38000, calories: 220, image: null, available: true, sortOrder: 2 },
      { id: "cheese-swiss", nameFa: "سوئیسی", nameEn: "Swiss", price: 42000, calories: 100, image: null, available: true, sortOrder: 3 },
      { id: "cheese-pepper-jack", nameFa: "پپر جک", nameEn: "Pepper Jack", price: 42000, calories: 110, image: null, available: true, sortOrder: 4 },
    ],
  },
  {
    id: "toppings",
    nameFa: "مخلفات",
    nameEn: "Toppings",
    selectionMode: "multi",
    required: true,
    options: [
      { id: "top-lettuce", nameFa: "کاهو", nameEn: "Lettuce", price: 12000, calories: 5, image: null, available: true, sortOrder: 1 },
      { id: "top-tomato", nameFa: "گوجه", nameEn: "Tomato", price: 15000, calories: 10, image: null, available: true, sortOrder: 2 },
      { id: "top-pickles", nameFa: "خیارشور", nameEn: "Pickles", price: 14000, calories: 5, image: null, available: true, sortOrder: 3 },
      { id: "top-jalapeno", nameFa: "هالاپینو", nameEn: "Jalapeño", price: 18000, calories: 5, image: null, available: true, sortOrder: 4 },
      { id: "top-caramelized-onion", nameFa: "پیاز کاراملی", nameEn: "Caramelized Onion", price: 25000, calories: 30, image: null, available: true, sortOrder: 5 },
      { id: "top-mushroom", nameFa: "قارچ", nameEn: "Mushroom", price: 28000, calories: 15, image: null, available: true, sortOrder: 6 },
      { id: "top-bacon", nameFa: "بیکن", nameEn: "Bacon-style", price: 45000, calories: 80, image: null, available: true, sortOrder: 7 },
      { id: "top-onion-ring", nameFa: "حلقه پیاز", nameEn: "Onion Ring", price: 28000, calories: 45, image: null, available: true, sortOrder: 8 },
    ],
  },
  {
    id: "sauce",
    nameFa: "سس",
    nameEn: "Sauce",
    selectionMode: "multi",
    required: true,
    options: [
      { id: "sauce-chashni", nameFa: "سس مخصوص نمکدان", nameEn: "Namakdan Special", price: 18000, calories: 60, image: null, available: true, sortOrder: 1 },
      { id: "sauce-ketchup", nameFa: "کچاپ", nameEn: "Ketchup", price: 8000, calories: 20, image: null, available: true, sortOrder: 2 },
      { id: "sauce-mustard", nameFa: "سس خردل", nameEn: "Mustard", price: 8000, calories: 10, image: null, available: true, sortOrder: 3 },
      { id: "sauce-mayo", nameFa: "مایونز", nameEn: "Mayo", price: 10000, calories: 90, image: null, available: true, sortOrder: 4 },
      { id: "sauce-bbq", nameFa: "باربیکیو", nameEn: "BBQ", price: 15000, calories: 50, image: null, available: true, sortOrder: 5 },
      { id: "sauce-truffle", nameFa: "ترافل آیولی", nameEn: "Truffle Aioli", price: 35000, calories: 70, image: null, available: true, sortOrder: 6 },
    ],
  },
];
