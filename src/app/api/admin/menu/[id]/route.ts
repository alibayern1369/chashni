import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/menu/:id — update a menu item (partial fields).
 * DELETE /api/admin/menu/:id — delete a menu item.
 */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const body = await parseBody<Record<string, unknown>>(req);
  if (!body) return apiError("Invalid body", 400);

  const updates: Record<string, unknown> = {};
  const allowed = [
    "category_id",
    "name_fa",
    "name_en",
    "desc_fa",
    "desc_en",
    "base_price",
    "image",
    "calories",
    "preparation_time",
    "spicy_level",
    "is_vegetarian",
    "is_bestseller",
    "is_new",
    "is_chef_pick",
    "available",
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (typeof body.ingredients_fa === "object" && body.ingredients_fa) {
    const faArr = body.ingredients_fa as string[];
    const enArr = (body.ingredients_en as string[]) ?? [];
    updates.ingredients = faArr.map((fa, i) => ({ fa, en: enArr[i] ?? "" }));
  }
  if (typeof body.allergens_fa === "object" && body.allergens_fa) {
    const faArr = body.allergens_fa as string[];
    const enArr = (body.allergens_en as string[]) ?? [];
    updates.allergens = faArr.map((fa, i) => ({ fa, en: enArr[i] ?? "" }));
  }

  if (Object.keys(updates).length === 0) return apiError("No updates provided", 400);

  const { data, error } = await supabase
    .from("menu_items")
    .update(updates)
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .select()
    .single();

  if (error || !data) return apiError("Failed to update menu item", 403);
  return NextResponse.json({ item: data });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenant.id);

  if (error) return apiError("Failed to delete menu item", 403);
  return NextResponse.json({ ok: true });
}