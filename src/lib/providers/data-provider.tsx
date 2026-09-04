"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Category, MenuItem, Restaurant, BurgerCategory } from "@/lib/types";
import {
  categories as staticCategories,
  menuItems as staticMenuItems,
  burgerOptions as staticBurgerOptions,
  restaurant as staticRestaurant,
} from "@/lib/data";

interface MenuContextValue {
  categories: Category[];
  menuItems: MenuItem[];
  burgerOptions: BurgerCategory[];
  restaurant: Restaurant;
  loading: boolean;
  error: string | null;
}

const MenuContext = createContext<MenuContextValue>({
  categories: staticCategories,
  menuItems: staticMenuItems,
  burgerOptions: staticBurgerOptions,
  restaurant: staticRestaurant,
  loading: true,
  error: null,
});

export function useMenuContext() {
  return useContext(MenuContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(staticCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(staticMenuItems);
  const [burgerOpts, setBurgerOpts] = useState<BurgerCategory[]>(staticBurgerOptions);
  const [restaurantInfo, setRestaurantInfo] = useState<Restaurant>(staticRestaurant);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [menuRes, restaurantRes, burgerRes] = await Promise.all([
          fetch("/api/menu").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/restaurant").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/burger-components").then((r) => (r.ok ? r.json() : null)),
        ]);

        if (cancelled) return;

        if (menuRes?.categories) setCategories(menuRes.categories);
        if (menuRes?.items) setMenuItems(menuRes.items);
        if (burgerRes?.categories) setBurgerOpts(burgerRes.categories);

        if (restaurantRes?.tenant) {
          const t = restaurantRes.tenant;
          const s = restaurantRes.settings as Record<string, unknown>;
          const design = (s?.design ?? {}) as Record<string, string>;
          const hours = (s?.hours ?? {}) as Record<string, string>;
          setRestaurantInfo({
            nameFa: t.name_fa ?? staticRestaurant.nameFa,
            nameEn: t.name_en ?? staticRestaurant.nameEn,
            sloganFa: t.slogan_fa ?? staticRestaurant.sloganFa,
            sloganEn: t.slogan_en ?? staticRestaurant.sloganEn,
            addressFa: t.address_fa ?? staticRestaurant.addressFa,
            addressEn: t.address_en ?? staticRestaurant.addressEn,
            phone: t.phone ?? staticRestaurant.phone,
            branches: staticRestaurant.branches,
            hours: {
              open: hours.open ?? staticRestaurant.hours.open,
              close: hours.close ?? staticRestaurant.hours.close,
            },
          });
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const value = useMemo<MenuContextValue>(
    () => ({
      categories,
      menuItems,
      burgerOptions: burgerOpts,
      restaurant: restaurantInfo,
      loading,
      error,
    }),
    [categories, menuItems, burgerOpts, restaurantInfo, loading, error],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
