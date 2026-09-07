import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError, parseBody } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/promotions/:id — update promotion.
 * DELETE /api/admin/promotions/:id — delete promotion.
 */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "orders")) return apiError("Orders module disabled", 403);

  const body = await parseBody<Record<string, unknown>>(req);
  if (!body) return apiError("Invalid body", 400);

  const updates: Record<string, unknown> = {};
  const allowed = [
    "code",
    "description_fa",
    "description_en",
    "discount_type",
    "discount_value",
    "min_order",
    "max_uses",
    "valid_from",
    "valid_until",
    "is_active",
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (updates.discount_type === "percent") updates.discount_type = "percentage";
  if (Object.keys(updates).length === 0) return apiError("No updates provided", 400);

  const { data, error } = await supabase
    .from("promotions")
    .update(updates)
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .select()
    .single();

  if (error || !data) return apiError("Failed to update promotion", 403);
  return NextResponse.json({ promotion: data });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "orders")) return apiError("Orders module disabled", 403);

  const { error } = await supabase
    .from("promotions")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenant.id);

  if (error) return apiError("Failed to delete promotion", 403);
  return NextResponse.json({ ok: true });
}
