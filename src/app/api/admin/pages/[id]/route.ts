import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError, parseBody } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/pages/:id — page with its blocks.
 * PATCH /api/admin/pages/:id — update page meta.
 * DELETE /api/admin/pages/:id — delete page (cascades blocks).
 * POST /api/admin/pages/:id — add a block to the page.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "cms")) return apiError("CMS module disabled", 403);

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .single();
  if (error || !page) return apiError("Page not found", 404);

  const { data: blocks } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("page_id", id)
    .order("sort_order", { ascending: true });

  return NextResponse.json({ page, blocks: blocks ?? [] });
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "cms")) return apiError("CMS module disabled", 403);

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .maybeSingle();
  if (!page) return apiError("Page not found", 404);

  const body = await parseBody<{
    type?: string;
    content?: Record<string, unknown>;
  }>(req);

  const type = body?.type || "text";
  const allowedTypes = [
    "hero",
    "text",
    "image",
    "gallery",
    "features",
    "testimonials",
    "cta",
    "menu_highlight",
    "custom_html",
  ];
  if (!allowedTypes.includes(type)) return apiError("Invalid block type", 400);

  const { data: existing } = await supabase
    .from("page_blocks")
    .select("sort_order")
    .eq("page_id", id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;
  const defaultContent: Record<string, unknown> = {
    heading: "",
    headingFa: "",
    subtitle: "",
    subtitleFa: "",
    buttonText: "",
    buttonTextFa: "",
    imageUrl: "",
    ...(body?.content ?? {}),
  };

  const { data: block, error } = await supabase
    .from("page_blocks")
    .insert({
      page_id: id,
      type,
      content: defaultContent,
      sort_order: nextOrder,
      is_visible: true,
    })
    .select()
    .single();

  if (error || !block) return apiError("Failed to create block: " + (error?.message ?? ""), 500);
  return NextResponse.json({ block }, { status: 201 });
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "cms")) return apiError("CMS module disabled", 403);

  const body = await parseBody<Record<string, unknown>>(req);
  if (!body) return apiError("Invalid body", 400);

  const updates: Record<string, unknown> = {};
  const allowed = [
    "slug",
    "title_fa",
    "title_en",
    "description_fa",
    "description_en",
    "is_published",
    "sort_order",
    "meta_title",
    "meta_description",
    "og_image",
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) return apiError("No updates provided", 400);

  const { data, error } = await supabase
    .from("pages")
    .update(updates)
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .select()
    .single();

  if (error || !data) return apiError("Failed to update page", 403);
  return NextResponse.json({ page: data });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "cms")) return apiError("CMS module disabled", 403);

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenant.id);

  if (error) return apiError("Failed to delete page", 403);
  return NextResponse.json({ ok: true });
}
