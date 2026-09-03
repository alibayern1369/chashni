import { BurgerCategory } from "../types";

export const burgerOptions: BurgerCategory[] = [
  {
    id: "bun",
    nameFa: "نان",
    nameEn: "Bun",
    options: [
      { id: "bun-brioche", nameFa: "بریوشه", nameEn: "Brioche", price: 0, calories: 210 },
      { id: "bun-pretzel", nameFa: "تزئیلی", nameEn: "Pretzel", price: 15000, calories: 230 },
      { id: "bun-sesame", nameFa: "کنجدی", nameEn: "Sesame", price: 0, calories: 200 },
      { id: "bun-whole-wheat", nameFa: "سبوس‌دار", nameEn: "Whole Wheat", price: 12000, calories: 180 },
    ],
  },
  {
    id: "patty",
    nameFa: "پتی",
    nameEn: "Patty",
    options: [
      { id: "patty-single", nameFa: "سینگل گوشت گوساله", nameEn: "Single Beef", price: 0, calories: 320 },
      { id: "patty-double", nameFa: "دابل گوشت گوساله", nameEn: "Double Beef", price: 65000, calories: 640 },
      { id: "patty-chicken", nameFa: "سینه مرغ", nameEn: "Chicken Breast", price: 0, calories: 250 },
      { id: "patty-plant", nameFa: "پتی گیاهی", nameEn: "Plant-based", price: 35000, calories: 220 },
    ],
  },
  {
    id: "cheese",
    nameFa: "پنیر",
    nameEn: "Cheese",
    options: [
      { id: "cheese-cheddar", nameFa: "چدار استاندارد", nameEn: "Standard Cheddar", price: 0, calories: 110 },
      { id: "cheese-extra-cheddar", nameFa: "چدار اضافه", nameEn: "Extra Cheddar", price: 18000, calories: 220 },
      { id: "cheese-swiss", nameFa: "سوئیسی", nameEn: "Swiss", price: 22000, calories: 100 },
      { id: "cheese-pepper-jack", nameFa: "پپر جک", nameEn: "Pepper Jack", price: 22000, calories: 110 },
    ],
  },
  {
    id: "toppings",
    nameFa: "تاسینگ",
    nameEn: "Toppings",
    options: [
      { id: "top-lettuce", nameFa: "کاهو", nameEn: "Lettuce", price: 0, calories: 5 },
      { id: "top-tomato", nameFa: "گوجه", nameEn: "Tomato", price: 0, calories: 10 },
      { id: "top-pickles", nameFa: "خیارشور", nameEn: "Pickles", price: 0, calories: 5 },
      { id: "top-jalapeno", nameFa: "jalapeño", nameEn: "Jalapeño", price: 8000, calories: 5 },
      { id: "top-caramelized-onion", nameFa: "پیاز کاراملی", nameEn: "Caramelized Onion", price: 15000, calories: 30 },
      { id: "top-mushroom", nameFa: "قارچ", nameEn: "Mushroom", price: 18000, calories: 15 },
      { id: "top-bacon", nameFa: "بیکن", nameEn: "Bacon-style", price: 28000, calories: 80 },
      { id: "top-onion-ring", nameFa: "حلقه پیاز", nameEn: "Onion Ring", price: 18000, calories: 45 },
    ],
  },
  {
    id: "sauce",
    nameFa: "سس",
    nameEn: "Sauce",
    options: [
      { id: "sauce-chashni", nameFa: "سس مخصوص چاشنی", nameEn: "CHASHNI Special", price: 0, calories: 60 },
      { id: "sauce-ketchup", nameFa: "کچاپ", nameEn: "Ketchup", price: 0, calories: 20 },
      { id: "sauce-mustard", nameFa: "سس خردل", nameEn: "Mustard", price: 0, calories: 10 },
      { id: "sauce-mayo", nameFa: "مایونز", nameEn: "Mayo", price: 0, calories: 90 },
      { id: "sauce-bbq", nameFa: "باربیکیو", nameEn: "BBQ", price: 8000, calories: 50 },
      { id: "sauce-truffle", nameFa: "ترافل آیولی", nameEn: "Truffle Aioli", price: 22000, calories: 70 },
    ],
  },
];
