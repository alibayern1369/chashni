"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, Pencil, Trash2, RefreshCw, LayoutGrid } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface AdminCategory {
  id: string;
  slug: string;
  name_fa: string;
  name_en: string;
  icon: string | null;
  sort_order: number;
  is_visible: boolean;
}

interface AdminMenuItem {
  id: string;
  category_id: string;
  name_fa: string;
  name_en: string;
  desc_fa: string | null;
  desc_en: string | null;
  base_price: number;
  image: string | null;
  is_bestseller: boolean;
  is_new: boolean;
  is_chef_pick: boolean;
  is_vegetarian: boolean;
  available: boolean;
  categories: { id: string; slug: string; name_fa: string; name_en: string } | null;
}

export default function AdminMenuPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editItem, setEditItem] = useState<AdminMenuItem | null>(null);
  const [editCat, setEditCat] = useState<AdminCategory | null>(null);

  const emptyItemForm = {
    category_id: "",
    name_fa: "",
    name_en: "",
    desc_fa: "",
    desc_en: "",
    base_price: "",
    image: "",
    is_bestseller: false,
    is_new: false,
    is_chef_pick: false,
    is_vegetarian: false,
    available: true,
  };
  const [itemForm, setItemForm] = useState(emptyItemForm);

  const emptyCatForm = { name_fa: "", name_en: "", icon: "" };
  const [catForm, setCatForm] = useState(emptyCatForm);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/menu"),
      ]);
      const catData = await catRes.json();
      const itemData = await itemRes.json();
      if (!catRes.ok) {
        setError(catData?.error || "Failed to load categories");
        return;
      }
      if (!itemRes.ok) {
        setError(itemData?.error || "Failed to load items");
        return;
      }
      setCategories(catData.categories ?? []);
      setItems(itemData.items ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const confirmDelete = (msg: string, fn: () => void) => {
    if (window.confirm(msg)) fn();
  };

  const saveCategory = async () => {
    if (!catForm.name_fa || !catForm.name_en) return;
    const url = editCat ? `/api/admin/categories/${editCat.id}` : "/api/admin/categories";
    const method = editCat ? "PATCH" : "POST";
    const body = editCat
      ? { name_fa: catForm.name_fa, name_en: catForm.name_en, icon: catForm.icon || undefined }
      : { name_fa: catForm.name_fa, name_en: catForm.name_en, icon: catForm.icon || undefined };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowCatForm(false);
      setEditCat(null);
      setCatForm(emptyCatForm);
      loadMenu();
    } else {
      const data = await res.json();
      setError(data?.error || "Save failed");
    }
  };

  const deleteCategory = async (id: string) => {
    confirmDelete(
      isRtl ? "حذف دسته‌بندی؟ همه آیتم‌هایش هم حذف می‌شوند." : "Delete this category? Its items will be deleted too.",
      async () => {
        const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        if (res.ok) loadMenu();
      },
    );
  };

  const saveItem = async () => {
    if (!itemForm.category_id || !itemForm.name_fa || !itemForm.name_en) return;
    const body = {
      ...itemForm,
      base_price: parseInt(itemForm.base_price, 10) || 0,
      image: itemForm.image || undefined,
    };
    const url = editItem ? `/api/admin/menu/${editItem.id}` : "/api/admin/menu";
    const method = editItem ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowItemForm(false);
      setEditItem(null);
      setItemForm(emptyItemForm);
      loadMenu();
    } else {
      const data = await res.json();
      setError(data?.error || "Save failed");
    }
  };

  const startEditItem = (item: AdminMenuItem) => {
    setEditItem(item);
    setItemForm({
      category_id: item.category_id,
      name_fa: item.name_fa,
      name_en: item.name_en,
      desc_fa: item.desc_fa ?? "",
      desc_en: item.desc_en ?? "",
      base_price: String(item.base_price),
      image: item.image ?? "",
      is_bestseller: item.is_bestseller,
      is_new: item.is_new,
      is_chef_pick: item.is_chef_pick,
      is_vegetarian: item.is_vegetarian,
      available: item.available,
    });
    setShowItemForm(true);
  };

  const toggleAvailable = async (item: AdminMenuItem) => {
    const res = await fetch(`/api/admin/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    if (res.ok) loadMenu();
  };

  const deleteItem = async (id: string) => {
    confirmDelete(isRtl ? "حذف این آیتم منو؟" : "Delete this menu item?", async () => {
      const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
      if (res.ok) loadMenu();
    });
  };

  const inputCls =
    "w-full rounded-xl bg-[#1a1a1a] border border-[#333] px-3 py-2.5 text-sm text-[#faf5e4] outline-none focus:border-amber-500/50";

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#faf5e4]">
          {isRtl ? "مدیریت منو" : "Menu Management"}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={loadMenu}
            className="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] px-3 py-2 text-xs text-[#ccc] hover:border-[#444]"
          >
            <RefreshCw size={14} />
            {isRtl ? "به‌روزرسانی" : "Refresh"}
          </button>
          <button
            onClick={() => {
              setShowCatForm((v) => !v);
              setShowItemForm(false);
              setEditCat(null);
              setEditItem(null);
              setCatForm(emptyCatForm);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#1e1e1e] px-3 py-2 text-xs font-semibold text-[#ccc] hover:border-amber-500/30 hover:text-amber-400"
          >
            <LayoutGrid size={14} />
            {isRtl ? "دسته‌بندی جدید" : "New Category"}
          </button>
          <button
            onClick={() => {
              setShowItemForm((v) => !v);
              setShowCatForm(false);
              setEditItem(null);
              setItemForm({
                ...emptyItemForm,
                category_id: categories[0]?.id ?? "",
              });
            }}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black hover:bg-amber-400"
          >
            <Plus size={14} />
            {isRtl ? "آیتم جدید" : "New Item"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showCatForm && (
        <div className="rounded-2xl bg-[#141414] border border-[#2a2010] p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#faf5e4]">
            {editCat
              ? isRtl ? "ویرایش دسته‌بندی" : "Edit Category"
              : isRtl ? "دسته‌بندی جدید" : "New Category"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={catForm.name_fa}
              onChange={(e) => setCatForm({ ...catForm, name_fa: e.target.value })}
              placeholder={isRtl ? "نام فارسی" : "Persian name"}
              className={inputCls}
            />
            <input
              value={catForm.name_en}
              onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })}
              placeholder={isRtl ? "نام انگلیسی" : "English name"}
              className={inputCls}
            />
            <input
              value={catForm.icon}
              onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
              placeholder={isRtl ? "آیکون (اختیاری)" : "Icon (optional)"}
              className={inputCls}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={saveCategory} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400">
              {isRtl ? "ذخیره" : "Save"}
            </button>
            <button
              onClick={() => {
                setShowCatForm(false);
                setEditCat(null);
              }}
              className="rounded-xl bg-[#1e1e1e] border border-[#333] px-5 py-2.5 text-sm text-[#ccc]"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {showItemForm && (
        <div className="rounded-2xl bg-[#141414] border border-[#2a2010] p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#faf5e4]">
            {editItem
              ? isRtl ? "ویرایش آیتم" : "Edit Item"
              : isRtl ? "آیتم منو جدید" : "New Menu Item"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "دسته‌بندی" : "Category"}</label>
              <select
                value={itemForm.category_id}
                onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                className={inputCls}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isRtl ? c.name_fa : c.name_en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "قیمت (تومان)" : "Price (Toman)"}</label>
              <input
                type="number"
                value={itemForm.base_price}
                onChange={(e) => setItemForm({ ...itemForm, base_price: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "نام فارسی" : "Name (FA)"}</label>
              <input
                value={itemForm.name_fa}
                onChange={(e) => setItemForm({ ...itemForm, name_fa: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "نام انگلیسی" : "Name (EN)"}</label>
              <input
                value={itemForm.name_en}
                onChange={(e) => setItemForm({ ...itemForm, name_en: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "توضیح فارسی" : "Description (FA)"}</label>
              <input
                value={itemForm.desc_fa}
                onChange={(e) => setItemForm({ ...itemForm, desc_fa: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "توضیح انگلیسی" : "Description (EN)"}</label>
              <input
                value={itemForm.desc_en}
                onChange={(e) => setItemForm({ ...itemForm, desc_en: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#666]">{isRtl ? "آدرس تصویر" : "Image URL"}</label>
              <input
                value={itemForm.image}
                onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                className={inputCls}
                dir="ltr"
                placeholder="https://..."
              />
            </div>
            <div className="flex flex-wrap items-end gap-2 pb-1">
              {[
                { key: "is_bestseller", label: isRtl ? "پرطرفدار" : "Bestseller" },
                { key: "is_new", label: isRtl ? "جدید" : "New" },
                { key: "is_chef_pick", label: isRtl ? "پیشنهاد سرآشپز" : "Chef's pick" },
                { key: "is_vegetarian", label: isRtl ? "گیاهی" : "Vegetarian" },
                { key: "available", label: isRtl ? "موجود" : "Available" },
              ].map((t) => {
                const key = t.key as keyof typeof itemForm;
                return (
                  <label key={t.key} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1a1a1a] border border-[#333] px-3 py-2 text-[11px] text-[#ccc]">
                    <input
                      type="checkbox"
                      checked={Boolean(itemForm[key])}
                      onChange={(e) => setItemForm({ ...itemForm, [key]: e.target.checked })}
                      className="accent-amber-500"
                    />
                    {t.label}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveItem} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400">
              {isRtl ? "ذخیره" : "Save"}
            </button>
            <button
              onClick={() => {
                setShowItemForm(false);
                setEditItem(null);
              }}
              className="rounded-xl bg-[#1e1e1e] border border-[#333] px-5 py-2.5 text-sm text-[#ccc]"
            >
              {isRtl ? "انصراف" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id);
          return (
            <div key={cat.id}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#ccc]">
                  {cat.icon && <span>{cat.icon}</span>}
                  {isRtl ? cat.name_fa : cat.name_en}
                  <span className="text-[#555]">({catItems.length})</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      cat.is_visible ? "bg-emerald-500/15 text-emerald-400" : "bg-[#222] text-[#666]",
                    )}
                  >
                    {isRtl ? (cat.is_visible ? "نمایش" : "مخفی") : cat.is_visible ? "Visible" : "Hidden"}
                  </span>
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditCat(cat);
                      setCatForm({ name_fa: cat.name_fa, name_en: cat.name_en, icon: cat.icon ?? "" });
                      setShowCatForm(true);
                      setShowItemForm(false);
                    }}
                    className="rounded-lg bg-[#1e1e1e] border border-[#333] p-1.5 text-[#ccc] hover:border-amber-500/40 hover:text-amber-400"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="rounded-lg bg-[#1e1e1e] border border-[#333] p-1.5 text-[#666] hover:border-red-500/40 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              {catItems.length === 0 ? (
                <div className="rounded-xl bg-[#141414] border border-[#1e1e1e] p-3 text-center text-xs text-[#666]">
                  {isRtl ? "آیتمی ندارد" : "No items"}
                </div>
              ) : (
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl bg-[#141414] border border-[#1e1e1e] p-3",
                        !item.available && "opacity-50",
                      )}
                    >
                      {item.image && (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#1a1a1a]">
                          <img src={item.image} alt={item.name_en} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-[#faf5e4]">
                          {isRtl ? item.name_fa : item.name_en}
                        </p>
                        <p className="text-xs text-[#666]">
                          {item.is_bestseller && "⭐ "}
                          {item.is_chef_pick && "👨‍🍳 "}
                          {item.is_new && "🆕 "}
                          {item.is_vegetarian && "🌱 "}
                          <span className="text-amber-400 font-semibold">{formatPrice(item.base_price, locale)}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => toggleAvailable(item)}
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
                          item.available ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400",
                        )}
                      >
                        {isRtl ? (item.available ? "موجود" : "ناموجود") : item.available ? "Available" : "Unavailable"}
                      </button>
                      <button
                        onClick={() => startEditItem(item)}
                        className="shrink-0 rounded-lg bg-[#1e1e1e] border border-[#333] p-2 text-[#ccc] hover:border-amber-500/40 hover:text-amber-400"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="shrink-0 rounded-lg bg-[#1e1e1e] border border-[#333] p-2 text-[#666] hover:border-red-500/40 hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-10 text-center text-sm text-[#888]">
          {isRtl ? "دسته‌بندی‌ای ثبت نشده است — اول دسته‌بندی بسازید" : "No categories yet — create one first"}
        </div>
      )}
    </div>
  );
}