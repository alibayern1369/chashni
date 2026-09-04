import { NextResponse } from "next/server";
import { getTenantFromRequest, apiError } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

/**
 * GET /api/menu — Fetch menu (categories + items) for the current tenant.
 */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();

  if (!tenant) {
    return apiError("Tenant not found", 404);
  }

  if (!hasModule(tenant, "menu")) {
    return apiError("Menu module is not enabled for this tenant", 403);
  }

  const [categoriesRes, itemsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("is_visible", true)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("available", true)
      .order("sort_order"),
  ]);

  if (categoriesRes.error || itemsRes.error) {
    return apiError("Failed to fetch menu", 500);
  }

  const { dbCategoryToUI, dbMenuItemToUI } = await import("@/lib/types");

  const categories = categoriesRes.data.map(dbCategoryToUI);
  const categorySlugMap = new Map(
    categoriesRes.data.map((c) => [c.id, c.slug]),
  );
  const items = itemsRes.data.map((item) =>
    dbMenuItemToUI(
      item,
      categorySlugMap.get(item.category_id) ?? "",
    ),
  );

  return NextResponse.json({ categories, items });
}
