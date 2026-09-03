"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { menuItems, categories } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";

type ToggleField = "available" | "isBestseller" | "isNew";

const toggleColumns: { field: ToggleField; label: string }[] = [
  { field: "available", label: "Available" },
  { field: "isBestseller", label: "Bestseller" },
  { field: "isNew", label: "New" },
];

export default function MenuPage() {
  const [items, setItems] = useState(() =>
    menuItems.map((item) => ({ ...item }))
  );
  const [query, setQuery] = useState("");

  const toggleField = (id: string, field: ToggleField) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.nameEn.toLowerCase().includes(q) ||
        item.nameFa.includes(query.trim())
    );
  }, [items, query]);

  const categoryCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.categorySlug, (map.get(item.categorySlug) ?? 0) + 1);
    }
    return map;
  }, [items]);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Menu Items</h1>
          <p className="mt-1 text-sm text-[#888]">
            {items.length} items · toggle availability and badges
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            className="w-full rounded-xl border border-[#222] bg-[#141414] py-2.5 pl-9 pr-4 text-sm text-[#ccc] placeholder-[#555] focus:border-amber-500/40 focus:outline-none sm:w-64"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#141414] px-3 py-1 text-[11px] font-semibold text-[#666]">
          {items.filter((i) => i.available).length} available
        </span>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-400">
          {items.filter((i) => i.isBestseller).length} bestsellers
        </span>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
          {items.filter((i) => i.isNew).length} new
        </span>
        <span className="rounded-full bg-[#141414] px-3 py-1 text-[11px] font-semibold text-[#666]">
          {categories.length} categories
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#1e1e1e]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e] text-left text-xs uppercase tracking-wider text-[#666]">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              {toggleColumns.map((col) => (
                <th key={col.field} className="px-4 py-3 text-center">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const cat = categories.find((c) => c.slug === item.categorySlug);
              return (
                <motion.tr
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-[#141414] transition-colors hover:bg-[#141414]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#1a1a1a]">
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-[#ccc]">{item.nameEn}</p>
                        <p className="text-xs text-[#666]">{item.nameFa}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#888]">
                    <span className="whitespace-nowrap rounded-md bg-[#1a1a1a] px-2 py-1 text-[11px] font-semibold">
                      {cat?.icon ?? ""} {cat?.nameEn ?? item.categorySlug}
                    </span>
                    <span className="ml-2 text-[10px] text-[#555]">
                      {categoryCount.get(item.categorySlug) ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-amber-400">
                    {formatPrice(item.basePrice, "en")}
                  </td>
                  {toggleColumns.map((col) => (
                    <td key={col.field} className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleField(item.id, col.field)}
                        aria-label={`Toggle ${col.label} for ${item.nameEn}`}
                        className={cn(
                          "relative h-6 w-11 rounded-full transition-colors",
                          item[col.field] ? "bg-amber-500" : "bg-[#333]"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                            item[col.field] ? "left-[22px]" : "left-0.5"
                          )}
                        />
                      </button>
                    </td>
                  ))}
                </motion.tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3 + toggleColumns.length} className="px-4 py-12 text-center">
                  <p className="text-sm text-[#555]">No items match your search</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
