"use client";

import { useState, useMemo, useCallback } from "react";
import type { MenuItem } from "@/lib/types";
import { useLocaleContext } from "@/lib/providers/locale-provider";

export function useSearch(items: MenuItem[]) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("chashni-recent-searches") || "[]");
    } catch {
      return [];
    }
  });

  const { locale } = useLocaleContext();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return items.filter((item) => {
      const name = locale === "fa" ? item.nameFa : item.nameEn;
      const desc = locale === "fa" ? item.descFa : item.descEn;
      return (
        name.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        item.ingredients.some((i) => i.toLowerCase().includes(q)) ||
        item.ingredientsFa.some((i) => i.includes(q))
      );
    });
  }, [query, items, locale]);

  const addRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const next = [term, ...prev.filter((s) => s !== term)].slice(0, 8);
      localStorage.setItem("chashni-recent-searches", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("chashni-recent-searches");
  }, []);

  return { query, setQuery, results, recentSearches, addRecentSearch, clearRecentSearches };
}
