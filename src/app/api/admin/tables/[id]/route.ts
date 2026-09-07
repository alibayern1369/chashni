import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError, parseBody } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/tables/:id — update table (name/capacity/active).
 * DELETE /api/admin/tables/:id — delete a table.
 */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "tables")) return apiError("Tables module disabled", 403);

  const body = await parseBody<{
    number?: number;
    name?: string | null;
    capacity?: number;
    is_active?: boolean;
  }>(req);

  const updates: Record<string, unknown> = {};
  if (typeof body?.number === "number") updates.number = body.number;
  if (body?.name !== undefined) updates.name = body.name;
  if (typeof body?.capacity === "number") updates.capacity = body.capacity;
  if (typeof body?.is_active === "boolean") updates.is_active = body.is_active;

  if (Object.keys(updates).length === 0) return apiError("No updates provided", 400);

  const { data, error } = await supabase
    .from("tables")
    .update(updates)
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .select()
    .single();

  if (error || !data) return apiError("Failed to update table", 403);
  return NextResponse.json({ table: data });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "tables")) return apiError("Tables module disabled", 403);

  const { error } = await supabase
    .from("tables")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenant.id);

  if (error) return apiError("Failed to delete table", 403);
  return NextResponse.json({ ok: true });
}
