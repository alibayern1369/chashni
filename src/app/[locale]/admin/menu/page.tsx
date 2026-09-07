"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Plus, Pencil, Trash2, RefreshCw, LayoutGrid } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { CategoryIconPicker } from "@/components/admin/menu/category-icon-picker";
import {
  MenuItemModal,
  emptyMenuItemForm,
  type MenuItemFormState,
} from "@/components/admin/menu/menu-item-modal";
import { iconEmoji } from "@/lib/admin/food-icons";
import type { Extra, Locale, OptionGroup } from "@/lib/types";

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
  calories?: number;
  preparation_time?: number;
  spicy_level?: number;
  ingredients?: { fa: string; en: string }[];
  allergens?: { fa: string; en: string }[];
  options?: OptionGroup[];
  extras?: Extra[];
  stock_qty?: number | null;
  is_bestseller: boolean;
  is_new: boolean;
  is_chef_pick: boolean;
  is_vegetarian: boolean;
  available: boolean;
}

function splitList(s: string) {
  return s
    .split(/[,،]/)
    .map((x) => x.trim())
    .filter(Boolean);
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
  const [editCat, setEditCat] = useState<AdminCategory | null>(null);
  const [catForm, setCatForm] = useState({ name_fa: "", name_en: "", icon: "🍔" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminMenuItem | null>(null);
  const [itemForm, setItemForm] = useState<MenuItemFormState>(emptyMenuItemForm());
  const [saving, setSaving] = useState(false);

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

  const saveCategory = async () => {
    if (!catForm.name_fa || !catForm.name_en) return;
    const url = editCat ? `/api/admin/categories/${editCat.id}` : "/api/admin/categories";
    const method = editCat ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name_fa: catForm.name_fa,
        name_en: catForm.name_en,
        icon: catForm.icon || undefined,
      }),
    });
    if (res.ok) {
      setShowCatForm(false);
      setEditCat(null);
      setCatForm({ name_fa: "", name_en: "", icon: "🍔" });
      loadMenu();
    } else {
      const data = await res.json();
      setError(data?.error || "Save failed");
    }
  };

  const deleteCategory = async (id: string) => {
    if (
      !window.confirm(
        isRtl
          ? "حذف دسته‌بندی؟ همه آیتم‌هایش هم حذف می‌شوند."
          : "Delete category and its items?",
      )
    )
      return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) loadMenu();
  };

  const openCreateItem = () => {
    setEditItem(null);
    setItemForm(emptyMenuItemForm(categories[0]?.id ?? ""));
    setModalOpen(true);
  };

  const openEditItem = (item: AdminMenuItem) => {
    setEditItem(item);
    setItemForm({
      category_id: item.category_id,
      name_fa: item.name_fa,
      name_en: item.name_en,
      desc_fa: item.desc_fa ?? "",
      desc_en: item.desc_en ?? "",
      base_price: String(item.base_price),
      image: item.image ?? "",
      calories: String(item.calories ?? 0),
      preparation_time: String(item.preparation_time ?? 15),
      spicy_level: String(item.spicy_level ?? 0),
      ingredients_fa: (item.ingredients ?? []).map((i) => i.fa).filter(Boolean).join("، "),
      ingredients_en: (item.ingredients ?? []).map((i) => i.en).filter(Boolean).join(", "),
      allergens_fa: (item.allergens ?? []).map((a) => a.fa).filter(Boolean).join("، "),
      allergens_en: (item.allergens ?? []).map((a) => a.en).filter(Boolean).join(", "),
      stock_qty: item.stock_qty == null ? "" : String(item.stock_qty),
      unlimited_stock: item.stock_qty == null,
      is_bestseller: item.is_bestseller,
      is_new: item.is_new,
      is_chef_pick: item.is_chef_pick,
      is_vegetarian: item.is_vegetarian,
      available: item.available,
      options: item.options ?? [],
      extras: item.extras ?? [],
    });
    setModalOpen(true);
  };

  const saveItem = async () => {
    if (!itemForm.category_id || !itemForm.name_fa || !itemForm.name_en) return;
    setSaving(true);
    const body = {
      category_id: itemForm.category_id,
      name_fa: itemForm.name_fa,
      name_en: itemForm.name_en,
      desc_fa: itemForm.desc_fa,
      desc_en: itemForm.desc_en,
      base_price: parseInt(itemForm.base_price, 10) || 0,
      image: itemForm.image || undefined,
      calories: parseInt(itemForm.calories, 10) || 0,
      preparation_time: parseInt(itemForm.preparation_time, 10) || 15,
      spicy_level: Math.min(5, Math.max(0, parseInt(itemForm.spicy_level, 10) || 0)),
      ingredients_fa: splitList(itemForm.ingredients_fa),
      ingredients_en: splitList(itemForm.ingredients_en),
      allergens_fa: splitList(itemForm.allergens_fa),
      allergens_en: splitList(itemForm.allergens_en),
      stock_qty: itemForm.unlimited_stock
        ? null
        : Math.max(0, parseInt(itemForm.stock_qty, 10) || 0),
      options: itemForm.options,
      extras: itemForm.extras,
      is_bestseller: itemForm.is_bestseller,
      is_new: itemForm.is_new,
      is_chef_pick: itemForm.is_chef_pick,
      is_vegetarian: itemForm.is_vegetarian,
      available: itemForm.available,
    };
    const url = editItem ? `/api/admin/menu/${editItem.id}` : "/api/admin/menu";
    const method = editItem ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setModalOpen(false);
      setEditItem(null);
      loadMenu();
    } else {
      const data = await res.json();
      setError(data?.error || "Save failed");
    }
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
    if (!window.confirm(isRtl ? "حذف این آیتم؟" : "Delete this item?")) return;
    const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    if (res.ok) loadMenu();
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#faf5e4]">
          {isRtl ? "مدیریت منو" : "Menu Management"}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadMenu}
            className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#1e1e1e] px-3 py-2 text-xs text-[#ccc]"
          >
            <RefreshCw size={14} />
            {isRtl ? "به‌روزرسانی" : "Refresh"}
          </button>
          <button
            onClick={() => {
              setShowCatForm(true);
              setEditCat(null);
              setCatForm({ name_fa: "", name_en: "", icon: "🍔" });
            }}
            className="flex items-center gap-2 rounded-xl border border-[#333] bg-[#1e1e1e] px-3 py-2 text-xs font-semibold text-[#ccc]"
          >
            <LayoutGrid size={14} />
            {isRtl ? "دسته‌بندی" : "Category"}
          </button>
          <button
            onClick={openCreateItem}
            disabled={categories.length === 0}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-40"
          >
            <Plus size={14} />
            {isRtl ? "آیتم جدید" : "New item"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showCatForm && (
        <div className="space-y-3 rounded-2xl border border-[#2a2010] bg-[#141414] p-5">
          <h3 className="text-sm font-bold text-[#faf5e4]">
            {editCat
              ? isRtl
                ? "ویرایش دسته‌بندی"
                : "Edit category"
              : isRtl
                ? "دسته‌بندی جدید"
                : "New category"}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={catForm.name_fa}
              onChange={(e) => setCatForm({ ...catForm, name_fa: e.target.value })}
              placeholder={isRtl ? "نام فارسی" : "Persian name"}
              className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
            />
            <input
              value={catForm.name_en}
              onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })}
              placeholder={isRtl ? "نام انگلیسی" : "English name"}
              className="rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#faf5e4]"
            />
          </div>
          <CategoryIconPicker
            value={catForm.icon}
            onChange={(emoji) => setCatForm({ ...catForm, icon: emoji })}
            isRtl={isRtl}
          />
          <div className="flex gap-2">
            <button
              onClick={saveCategory}
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black"
            >
              {isRtl ? "ذخیره" : "Save"}
            </button>
            <button
              onClick={() => {
                setShowCatForm(false);
                setEditCat(null);
              }}
              className="rounded-xl border border-[#333] bg-[#1e1e1e] px-5 py-2.5 text-sm text-[#ccc]"
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
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#ccc]">
                  <span className="text-lg">{iconEmoji(cat.icon)}</span>
                  {isRtl ? cat.name_fa : cat.name_en}
                  <span className="text-[#555]">({catItems.length})</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/admin/categories/${cat.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ is_visible: !cat.is_visible }),
                      });
                      loadMenu();
                    }}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      cat.is_visible
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-[#222] text-[#666]",
                    )}
                  >
                    {isRtl
                      ? cat.is_visible
                        ? "نمایش"
                        : "مخفی"
                      : cat.is_visible
                        ? "Visible"
                        : "Hidden"}
                  </button>
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditCat(cat);
                      setCatForm({
                        name_fa: cat.name_fa,
                        name_en: cat.name_en,
                        icon: cat.icon || "🍔",
                      });
                      setShowCatForm(true);
                    }}
                    className="rounded-lg border border-[#333] bg-[#1e1e1e] p-1.5 text-[#ccc]"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="rounded-lg border border-[#333] bg-[#1e1e1e] p-1.5 text-[#666] hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              {catItems.length === 0 ? (
                <div className="rounded-xl border border-[#1e1e1e] bg-[#141414] p-3 text-center text-xs text-[#666]">
                  {isRtl ? "آیتمی ندارد" : "No items"}
                </div>
              ) : (
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border border-[#1e1e1e] bg-[#141414] p-3",
                        !item.available && "opacity-50",
                      )}
                    >
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#faf5e4]">
                          {isRtl ? item.name_fa : item.name_en}
                        </p>
                        <p className="text-xs text-[#666]">
                          <span className="font-semibold text-amber-400">
                            {formatPrice(item.base_price, locale)}
                          </span>
                          {item.stock_qty != null && (
                            <span className="ms-2 text-amber-400/80">
                              {isRtl
                                ? `موجودی: ${item.stock_qty}`
                                : `Stock: ${item.stock_qty}`}
                            </span>
                          )}
                          {(item.options?.length ?? 0) > 0 && (
                            <span className="ms-2">
                              {item.options!.length} {isRtl ? "آپشن" : "opts"}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleAvailable(item)}
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
                          item.available
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400",
                        )}
                      >
                        {isRtl
                          ? item.available
                            ? "موجود"
                            : "ناموجود"
                          : item.available
                            ? "On"
                            : "Off"}
                      </button>
                      <button
                        onClick={() => openEditItem(item)}
                        className="shrink-0 rounded-lg border border-[#333] bg-[#1e1e1e] p-2 text-amber-400"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="shrink-0 rounded-lg border border-[#333] bg-[#1e1e1e] p-2 text-[#666] hover:text-red-400"
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
        <div className="rounded-2xl border border-[#1e1e1e] bg-[#141414] p-10 text-center text-sm text-[#888]">
          {isRtl
            ? "اول یک دسته‌بندی بسازید"
            : "Create a category first"}
        </div>
      )}

      <MenuItemModal
        open={modalOpen}
        isRtl={isRtl}
        title={
          editItem
            ? isRtl
              ? "ویرایش آیتم"
              : "Edit item"
            : isRtl
              ? "آیتم جدید"
              : "New item"
        }
        form={itemForm}
        setForm={setItemForm}
        categories={categories}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSave={saveItem}
      />
    </div>
  );
}
