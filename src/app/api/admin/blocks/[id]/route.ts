import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/blocks/:id — single block.
 * PATCH /api/admin/blocks/:id — update block content/visibility/order.
 * DELETE /api/admin/blocks/:id — delete block.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const { data: block, error } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !block) return apiError("Block not found", 404);

  // Verify the block belongs to a page of this tenant
  const { data: page } = await supabase
    .from("pages")
    .select("tenant_id")
    .eq("id", block.page_id)
    .single();
  if (!page || page.tenant_id !== tenant.id) return apiError("Block not found", 404);

  return NextResponse.json({ block });
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const body = await parseBody<{
    content?: Record<string, unknown>;
    type?: string;
    sort_order?: number;
    is_visible?: boolean;
  }>(req);

  const updates: Record<string, unknown> = {};
  if (body?.content !== undefined) updates.content = body.content;
  if (body?.type !== undefined) updates.type = body.type;
  if (typeof body?.sort_order === "number") updates.sort_order = body.sort_order;
  if (typeof body?.is_visible === "boolean") updates.is_visible = body.is_visible;

  if (Object.keys(updates).length === 0) return apiError("No updates provided", 400);

  // Verify ownership via page->tenant before update
  const { data: block } = await supabase
    .from("page_blocks")
    .select("page_id")
    .eq("id", id)
    .single();
  if (!block) return apiError("Block not found", 404);
  const { data: page } = await supabase
    .from("pages")
    .select("tenant_id")
    .eq("id", block.page_id)
    .single();
  if (!page || page.tenant_id !== tenant.id) return apiError("Not authorized", 403);

  const { data, error } = await supabase
    .from("page_blocks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return apiError("Failed to update block", 500);
  return NextResponse.json({ block: data });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const { data: block } = await supabase
    .from("page_blocks")
    .select("page_id")
    .eq("id", id)
    .single();
  if (!block) return apiError("Block not found", 404);
  const { data: page } = await supabase
    .from("pages")
    .select("tenant_id")
    .eq("id", block.page_id)
    .single();
  if (!page || page.tenant_id !== tenant.id) return apiError("Not authorized", 403);

  const { error } = await supabase.from("page_blocks").delete().eq("id", id);
  if (error) return apiError("Failed to delete block", 500);
  return NextResponse.json({ ok: true });
}