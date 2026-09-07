/**
 * Food category icon library for restaurant admin (Iranian + Western + fast food).
 */
export const FOOD_CATEGORY_ICONS: { id: string; emoji: string; labelFa: string; labelEn: string }[] = [
  { id: "burger", emoji: "🍔", labelFa: "برگر", labelEn: "Burger" },
  { id: "pizza", emoji: "🍕", labelFa: "پیتزا", labelEn: "Pizza" },
  { id: "kebab", emoji: "🥙", labelFa: "کباب / رول", labelEn: "Kebab / Wrap" },
  { id: "chicken", emoji: "🍗", labelFa: "مرغ", labelEn: "Chicken" },
  { id: "steak", emoji: "🥩", labelFa: "گوشت", labelEn: "Steak" },
  { id: "fish", emoji: "🐟", labelFa: "ماهی", labelEn: "Fish" },
  { id: "shrimp", emoji: "🦐", labelFa: "میگو", labelEn: "Shrimp" },
  { id: "rice", emoji: "🍚", labelFa: "برنج / چلو", labelEn: "Rice" },
  { id: "stew", emoji: "🍲", labelFa: "خورش", labelEn: "Stew" },
  { id: "soup", emoji: "🍜", labelFa: "سوپ / آش", labelEn: "Soup" },
  { id: "salad", emoji: "🥗", labelFa: "سالاد", labelEn: "Salad" },
  { id: "fries", emoji: "🍟", labelFa: "سیب‌زمینی", labelEn: "Fries" },
  { id: "sandwich", emoji: "🥪", labelFa: "ساندویچ", labelEn: "Sandwich" },
  { id: "hotdog", emoji: "🌭", labelFa: "هات‌داگ", labelEn: "Hot dog" },
  { id: "taco", emoji: "🌮", labelFa: "تاکو", labelEn: "Taco" },
  { id: "pasta", emoji: "🍝", labelFa: "پاستا", labelEn: "Pasta" },
  { id: "breakfast", emoji: "🍳", labelFa: "صبحانه", labelEn: "Breakfast" },
  { id: "bread", emoji: "🥖", labelFa: "نان", labelEn: "Bread" },
  { id: "cheese", emoji: "🧀", labelFa: "پنیر", labelEn: "Cheese" },
  { id: "egg", emoji: "🥚", labelFa: "تخم‌مرغ", labelEn: "Egg" },
  { id: "drink", emoji: "🥤", labelFa: "نوشیدنی", labelEn: "Drink" },
  { id: "coffee", emoji: "☕", labelFa: "قهوه", labelEn: "Coffee" },
  { id: "tea", emoji: "🍵", labelFa: "چای", labelEn: "Tea" },
  { id: "juice", emoji: "🧃", labelFa: "آبمیوه", labelEn: "Juice" },
  { id: "dessert", emoji: "🍰", labelFa: "دسر", labelEn: "Dessert" },
  { id: "ice-cream", emoji: "🍦", labelFa: "بستنی", labelEn: "Ice cream" },
  { id: "donut", emoji: "🍩", labelFa: "دونات", labelEn: "Donut" },
  { id: "cookie", emoji: "🍪", labelFa: "شیرینی", labelEn: "Cookie" },
  { id: "fruit", emoji: "🍇", labelFa: "میوه", labelEn: "Fruit" },
  { id: "vegan", emoji: "🌱", labelFa: "گیاهی", labelEn: "Vegan" },
  { id: "spicy", emoji: "🌶️", labelFa: "تند", labelEn: "Spicy" },
  { id: "chef", emoji: "👨‍🍳", labelFa: "پیشنهاد سرآشپز", labelEn: "Chef pick" },
  { id: "combo", emoji: "🎁", labelFa: "کمبو", labelEn: "Combo" },
  { id: "kids", emoji: "🧒", labelFa: "کودک", labelEn: "Kids" },
  { id: "appetizer", emoji: "🥨", labelFa: "پیش‌غذا", labelEn: "Appetizer" },
  { id: "iranian", emoji: "🇮🇷", labelFa: "ایرانی", labelEn: "Iranian" },
];

export function iconEmoji(idOrEmoji: string | null | undefined): string {
  if (!idOrEmoji) return "🍽️";
  const found = FOOD_CATEGORY_ICONS.find((i) => i.id === idOrEmoji || i.emoji === idOrEmoji);
  return found?.emoji ?? idOrEmoji;
}
