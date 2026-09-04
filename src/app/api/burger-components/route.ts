import { NextResponse } from "next/server";
import { getTenantFromRequest, apiError } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";
import type { BurgerCategory } from "@/lib/types";

/**
 * GET /api/burger-components — Fetch burger builder components for the tenant.
 */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();

  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "menu")) return apiError("Menu module disabled", 403);

  const { data, error } = await supabase
    .from("burger_components")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_available", true)
    .order("sort_order");

  if (error) return apiError("Failed to fetch burger components", 500);

  // Group by category into BurgerCategory shape
  const categories: BurgerCategory[] = [];
  const map = new Map<string, BurgerCategory>();

  for (const comp of data ?? []) {
    if (!map.has(comp.category)) {
      const newCat: BurgerCategory = {
        id: comp.category,
        nameFa: categoryLabel(comp.category, "fa"),
        nameEn: categoryLabel(comp.category, "en"),
        options: [],
      };
      map.set(comp.category, newCat);
      categories.push(newCat);
    }
    map.get(comp.category)!.options.push({
      id: comp.component_id,
      nameFa: comp.name_fa,
      nameEn: comp.name_en,
      price: comp.price,
      calories: comp.calories,
    });
  }

  return NextResponse.json({ categories });
}

function categoryLabel(category: string, lang: "fa" | "en"): string {
  const labels: Record<string, { fa: string; en: string }> = {
    bun: { fa: "نان", en: "Bun" },
    patty: { fa: "پتی", en: "Patty" },
    cheese: { fa: "پنیر", en: "Cheese" },
    toppings: { fa: "تاسینگ", en: "Toppings" },
    sauce: { fa: "سس", en: "Sauce" },
  };
  return labels[category]?.[lang] ?? category;
}
