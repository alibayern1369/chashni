import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { slugify } from "@/lib/slug";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/categories/:id — update category.
 * DELETE /api/admin/categories/:id — delete category (cascades menu_items via FK).
 */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const body = await parseBody<{
    name_fa?: string;
    name_en?: string;
    icon?: string;
    sort_order?: number;
    is_visible?: boolean;
  }>(req);

  const updates: Record<string, unknown> = {};
  if (body?.name_fa !== undefined) updates.name_fa = body.name_fa;
  if (body?.name_en !== undefined) updates.name_en = body.name_en;
  if (body?.icon !== undefined) updates.icon = body.icon;
  if (body?.sort_order !== undefined) updates.sort_order = body.sort_order;
  if (typeof body?.is_visible === "boolean") updates.is_visible = body.is_visible;
  if (body?.name_en !== undefined) updates.slug = slugify(body.name_en);

  if (Object.keys(updates).length === 0) return apiError("No updates provided", 400);

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .select()
    .single();

  if (error || !data) return apiError("Failed to update category", 403);
  return NextResponse.json({ category: data });
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
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenant.id);

  if (error) return apiError("Failed to delete category", 403);
  return NextResponse.json({ ok: true });
}