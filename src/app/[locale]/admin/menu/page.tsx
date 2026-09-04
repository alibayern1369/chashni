"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-provider";
import type { Locale, Category, MenuItem } from "@/lib/types";

export default function AdminMenuPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "fa";
  const isRtl = locale === "fa";
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load menu");
        return;
      }
      setCategories(data.categories ?? []);
      setItems(data.items ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#faf5e4]">
          {isRtl ? "مدیریت منو" : "Menu Management"}
        </h2>
        <button
          onClick={loadMenu}
          className="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#333] px-3 py-2 text-xs text-[#ccc] hover:border-[#444]"
        >
          <RefreshCw size={14} />
          {isRtl ? "به‌روزرسانی" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 text-center">
          <p className="text-3xl font-black text-[#faf5e4]">{categories.length}</p>
          <p className="text-[10px] text-[#888] mt-1">
            {isRtl ? "دسته‌بندی" : "Categories"}
          </p>
        </div>
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 text-center">
          <p className="text-3xl font-black text-[#faf5e4]">{items.length}</p>
          <p className="text-[10px] text-[#888] mt-1">
            {isRtl ? "آیتم منو" : "Menu Items"}
          </p>
        </div>
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 text-center">
          <p className="text-3xl font-black text-amber-400">
            {items.filter((i) => i.isBestseller).length}
          </p>
          <p className="text-[10px] text-[#888] mt-1">
            {isRtl ? "پرطرفدار" : "Bestsellers"}
          </p>
        </div>
        <div className="rounded-2xl bg-[#141414] border border-[#1e1e1e] p-4 text-center">
          <p className="text-3xl font-black text-emerald-400">
            {items.filter((i) => i.available).length}
          </p>
          <p className="text-[10px] text-[#888] mt-1">
            {isRtl ? "موجود" : "Available"}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.categorySlug === cat.slug);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id}>
              <h3 className="mb-2 text-sm font-bold text-[#ccc]">
                {isRtl ? cat.nameFa : cat.nameEn} <span className="text-[#555]">({catItems.length})</span>
              </h3>
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
                        <img src={item.image} alt={item.nameEn} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#faf5e4] truncate">
                        {isRtl ? item.nameFa : item.nameEn}
                      </p>
                      <p className="text-xs text-[#666]">
                        {item.isBestseller && "⭐ "}{item.isChefPick && "👨‍🍳 "}
                        {item.isVegetarian && "🌱 "}
                        {formatPrice(item.basePrice, locale)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        item.available
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400",
                      )}
                    >
                      {isRtl
                        ? item.available ? "موجود" : "ناموجود"
                        : item.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
