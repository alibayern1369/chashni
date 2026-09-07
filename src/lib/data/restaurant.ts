import { Restaurant } from "../types";

export const restaurant: Restaurant = {
  nameFa: "نمکدان",
  nameEn: "Namakdan",
  sloganFa: "طعمی که فراموشش نمی‌کنی",
  sloganEn: "A Taste You Won't Forget",
  addressFa: "تهران، خیابان ولیعصر، نبش کوچه گلستان، پلاک ۱۲۰",
  addressEn: "No. 120, Valiasr St. corner of Golestan Alley, Tehran",
  phone: "۰۲۱-۸۸۸۸۱۲۳۴",
  branches: [
    {
      id: "branch-1",
      nameFa: "سیتی سنتر",
      nameEn: "City Center",
      addressFa: "تهران، خیابان ولیعصر، نبش کوچه گلستان، پلاک ۱۲۰",
      addressEn: "No. 120, Valiasr St. corner of Golestan Alley, Tehran",
    },
  ],
  hours: {
    open: "11:00",
    close: "23:00",
  },
};

/** Default social destinations for Namakdan restaurant menu */
export const restaurantSocial = {
  instagram: "https://instagram.com/",
  telegram: "https://t.me/",
  whatsapp: "https://wa.me/982188881234",
};
