"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { OptionsExtrasEditor } from "@/components/admin/menu/options-extras-editor";
import type { Extra, OptionGroup } from "@/lib/types";

export type MenuItemFormState = {
  category_id: string;
  name_fa: string;
  name_en: string;
  desc_fa: string;
  desc_en: string;
  base_price: string;
  image: string;
  calories: string;
  preparation_time: string;
  spicy_level: string;
  ingredients_fa: string;
  ingredients_en: string;
  allergens_fa: string;
  allergens_en: string;
  stock_qty: string;
  unlimited_stock: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  is_chef_pick: boolean;
  is_vegetarian: boolean;
  available: boolean;
  options: OptionGroup[];
  extras: Extra[];
};

export const emptyMenuItemForm = (categoryId = ""): MenuItemFormState => ({
  category_id: categoryId,
  name_fa: "",
  name_en: "",
  desc_fa: "",
  desc_en: "",
  base_price: "",
  image: "",
  calories: "",
  preparation_time: "15",
  spicy_level: "0",
  ingredients_fa: "",
  ingredients_en: "",
  allergens_fa: "",
  allergens_en: "",
  stock_qty: "",
  unlimited_stock: true,
  is_bestseller: false,
  is_new: false,
  is_chef_pick: false,
  is_vegetarian: false,
  available: true,
  options: [],
  extras: [],
});

export function MenuItemModal({
  open,
  isRtl,
  title,
  form,
  setForm,
  categories,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  isRtl: boolean;
  title: string;
  form: MenuItemFormState;
  setForm: (f: MenuItemFormState) => void;
  categories: { id: string; name_fa: string; name_en: string }[];
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const inputCls =
    "w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50";

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.media?.file_url) {
        setForm({ ...form, image: data.media.file_url });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-[81] flex max-h-[96vh] w-full max-w-3xl flex-col rounded-t-3xl border border-[#2a2010] bg-[#0f0f0f] sm:max-h-[92vh] sm:rounded-3xl"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#1e1e1e] px-5 py-4">
          <h3 className="text-base font-bold text-[#faf5e4]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#888] hover:bg-[#1e1e1e] hover:text-[#faf5e4]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "دسته‌بندی" : "Category"}
              </label>
              <select
                className={inputCls}
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isRtl ? c.name_fa : c.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "قیمت (تومان)" : "Price"}
              </label>
              <input
                type="number"
                className={inputCls}
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "نام فارسی" : "Name (FA)"}
              </label>
              <input
                className={inputCls}
                value={form.name_fa}
                onChange={(e) => setForm({ ...form, name_fa: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "نام انگلیسی" : "Name (EN)"}
              </label>
              <input
                className={inputCls}
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "توضیح فارسی" : "Description (FA)"}
              </label>
              <input
                className={inputCls}
                value={form.desc_fa}
                onChange={(e) => setForm({ ...form, desc_fa: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "توضیح انگلیسی" : "Description (EN)"}
              </label>
              <input
                className={inputCls}
                value={form.desc_en}
                onChange={(e) => setForm({ ...form, desc_en: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] text-[#666]">
              {isRtl ? "تصویر" : "Image"}
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-400">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {isRtl ? "بارگذاری تصویر" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f);
                  }}
                />
              </label>
              {form.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
            </div>
            <input
              className={inputCls}
              dir="ltr"
              placeholder="https://..."
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "کالری" : "Calories"}
              </label>
              <input
                type="number"
                className={inputCls}
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "زمان (دقیقه)" : "Prep (min)"}
              </label>
              <input
                type="number"
                className={inputCls}
                value={form.preparation_time}
                onChange={(e) => setForm({ ...form, preparation_time: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "تندی ۰–۵" : "Spicy 0–5"}
              </label>
              <input
                type="number"
                min={0}
                max={5}
                className={inputCls}
                value={form.spicy_level}
                onChange={(e) => setForm({ ...form, spicy_level: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "موجودی" : "Stock"}
              </label>
              <input
                type="number"
                min={0}
                className={inputCls}
                disabled={form.unlimited_stock}
                value={form.stock_qty}
                onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
                placeholder={form.unlimited_stock ? (isRtl ? "نامحدود" : "Unlimited") : "0"}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-[#ccc]">
            <input
              type="checkbox"
              className="accent-amber-500"
              checked={form.unlimited_stock}
              onChange={(e) =>
                setForm({ ...form, unlimited_stock: e.target.checked, stock_qty: "" })
              }
            />
            {isRtl ? "موجودی نامحدود" : "Unlimited stock"}
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "مواد — فارسی (با ویرگول)" : "Ingredients FA (comma)"}
              </label>
              <input
                className={inputCls}
                value={form.ingredients_fa}
                onChange={(e) => setForm({ ...form, ingredients_fa: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "مواد — انگلیسی (با ویرگول)" : "Ingredients EN (comma)"}
              </label>
              <input
                className={inputCls}
                value={form.ingredients_en}
                onChange={(e) => setForm({ ...form, ingredients_en: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "آلرژن‌ها — فارسی" : "Allergens FA"}
              </label>
              <input
                className={inputCls}
                value={form.allergens_fa}
                onChange={(e) => setForm({ ...form, allergens_fa: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">
                {isRtl ? "آلرژن‌ها — انگلیسی" : "Allergens EN"}
              </label>
              <input
                className={inputCls}
                value={form.allergens_en}
                onChange={(e) => setForm({ ...form, allergens_en: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["is_bestseller", isRtl ? "پرطرفدار" : "Bestseller"],
                ["is_new", isRtl ? "جدید" : "New"],
                ["is_chef_pick", isRtl ? "پیشنهاد سرآشپز" : "Chef pick"],
                ["is_vegetarian", isRtl ? "گیاهی" : "Vegetarian"],
                ["available", isRtl ? "موجود" : "Available"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 text-[11px] text-[#ccc]"
              >
                <input
                  type="checkbox"
                  className="accent-amber-500"
                  checked={Boolean(form[key])}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>

          <OptionsExtrasEditor
            options={form.options}
            extras={form.extras}
            onChangeOptions={(options) => setForm({ ...form, options })}
            onChangeExtras={(extras) => setForm({ ...form, extras })}
            isRtl={isRtl}
          />
        </div>

        <div className="flex shrink-0 gap-2 border-t border-[#1e1e1e] px-5 py-4">
          <button
            type="button"
            disabled={saving || !form.name_fa || !form.name_en || !form.category_id}
            onClick={onSave}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-40"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : isRtl ? "ذخیره" : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#333] bg-[#1e1e1e] px-5 py-2.5 text-sm text-[#ccc]"
          >
            {isRtl ? "انصراف" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
