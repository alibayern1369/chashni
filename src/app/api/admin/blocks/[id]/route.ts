import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError, parseBody } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";
import type { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function assertBlockTenant(supabase: Supabase, blockId: string, tenantId: string) {
  const { data: block } = await supabase
    .from("page_blocks")
    .select("id, page_id")
    .eq("id", blockId)
    .single();
  if (!block) return null;
  const { data: page } = await supabase
    .from("pages")
    .select("tenant_id")
    .eq("id", block.page_id)
    .single();
  if (!page || page.tenant_id !== tenantId) return null;
  return block;
}

/**
 * GET /api/admin/blocks/:id — single block.
 * PATCH /api/admin/blocks/:id — update block content/visibility/order.
 * DELETE /api/admin/blocks/:id — delete block.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "cms")) return apiError("CMS module disabled", 403);

  const owned = await assertBlockTenant(supabase, id, tenant.id);
  if (!owned) return apiError("Block not found", 404);

  const { data: block, error } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !block) return apiError("Block not found", 404);

  return NextResponse.json({ block });
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "cms")) return apiError("CMS module disabled", 403);

  const owned = await assertBlockTenant(supabase, id, tenant.id);
  if (!owned) return apiError("Block not found", 404);

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
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "cms")) return apiError("CMS module disabled", 403);

  const owned = await assertBlockTenant(supabase, id, tenant.id);
  if (!owned) return apiError("Block not found", 404);

  const { error } = await supabase.from("page_blocks").delete().eq("id", id);
  if (error) return apiError("Failed to delete block", 500);
  return NextResponse.json({ ok: true });
}
