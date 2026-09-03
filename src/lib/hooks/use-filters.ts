"use client";

import { useState, useCallback, useMemo } from "react";
import type { FilterOptions, MenuItem } from "@/lib/types";

const defaultFilters: FilterOptions = {
  vegetarian: false,
  spicy: false,
  bestseller: false,
  chefPick: false,
  isNew: false,
};

export function useFilters(items: MenuItem[]) {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  const onFilterChange = useCallback(<K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onClear = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const hasActiveFilters = useMemo(() => Object.values(filters).some((v) => v === true), [filters]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.vegetarian && !item.isVegetarian) return false;
      if (filters.spicy && item.spicyLevel === 0) return false;
      if (filters.bestseller && !item.isBestseller) return false;
      if (filters.chefPick && !item.isChefPick) return false;
      if (filters.isNew && !item.isNew) return false;
      return true;
    });
  }, [items, filters]);

  return { filters, onFilterChange, onClear, hasActiveFilters, filteredItems };
}
