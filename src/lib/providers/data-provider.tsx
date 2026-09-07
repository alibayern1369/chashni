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
import { restaurantSocial } from "@/lib/data/restaurant";

interface MenuContextValue {
  categories: Category[];
  menuItems: MenuItem[];
  burgerOptions: BurgerCategory[];
  restaurant: Restaurant;
  social: typeof restaurantSocial;
  loading: boolean;
  error: string | null;
}

const MenuContext = createContext<MenuContextValue>({
  categories: staticCategories,
  menuItems: staticMenuItems,
  burgerOptions: staticBurgerOptions,
  restaurant: staticRestaurant,
  social: restaurantSocial,
  loading: false,
  error: null,
});

export function useMenuContext() {
  return useContext(MenuContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories] = useState<Category[]>(staticCategories);
  const [menuItems] = useState<MenuItem[]>(staticMenuItems);
  const [burgerOpts] = useState<BurgerCategory[]>(staticBurgerOptions);
  const [restaurantInfo, setRestaurantInfo] = useState<Restaurant>(staticRestaurant);
  const [social, setSocial] = useState(restaurantSocial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    async function load() {
      try {
        // Menu stays on static catalog so pizza/chicken stay filled, Persian stays
        // Persian, and first paint stays fast. Only restaurant meta is refreshed.
        const restaurantRes = await fetch("/api/restaurant", {
          signal: controller.signal,
        }).then((r) => (r.ok ? r.json() : null));

        if (cancelled || !restaurantRes) return;

        const t = restaurantRes.tenant;
        const s = (restaurantRes.settings ?? {}) as Record<string, unknown>;
        const hours = (s.hours ?? {}) as Record<string, string>;
        const socialSetting = (s.social ?? {}) as Record<string, string>;

        setRestaurantInfo((prev) => ({
          ...prev,
          nameFa: staticRestaurant.nameFa,
          nameEn: staticRestaurant.nameEn,
          sloganFa: staticRestaurant.sloganFa,
          sloganEn: staticRestaurant.sloganEn,
          phone: t?.phone || prev.phone,
          addressFa: staticRestaurant.addressFa,
          addressEn: staticRestaurant.addressEn,
          hours: {
            open: hours.open ?? prev.hours.open,
            close: hours.close ?? prev.hours.close,
          },
        }));

        setSocial({
          instagram: socialSetting.instagram || restaurantSocial.instagram,
          telegram: socialSetting.telegram || restaurantSocial.telegram,
          whatsapp: socialSetting.whatsapp || restaurantSocial.whatsapp,
        });
      } catch (e) {
        if (!cancelled && (e as Error)?.name !== "AbortError") {
          setError(String(e));
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  const value = useMemo<MenuContextValue>(
    () => ({
      categories,
      menuItems,
      burgerOptions: burgerOpts,
      restaurant: restaurantInfo,
      social,
      loading,
      error,
    }),
    [categories, menuItems, burgerOpts, restaurantInfo, social, loading, error],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
