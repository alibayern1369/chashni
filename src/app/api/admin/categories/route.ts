import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { slugify } from "@/lib/slug";

/**
 * GET /api/admin/categories — list categories for tenant (admin).
 * POST /api/admin/categories — create a category.
 * RLS enforces tenant membership; only members see/modify tenant rows.
 */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("sort_order", { ascending: true });

  if (error) return apiError("Failed to load categories", 500);
  return NextResponse.json({ categories: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const body = await parseBody<{
    name_fa: string;
    name_en: string;
    icon?: string;
    sort_order?: number;
  }>(req);
  if (!body?.name_fa || !body?.name_en) return apiError("name_fa and name_en required", 400);

  const slug = slugify(body.name_en);
  const { data, error } = await supabase
    .from("categories")
    .insert({
      tenant_id: tenant.id,
      slug,
      name_fa: body.name_fa,
      name_en: body.name_en,
      icon: body.icon ?? null,
      sort_order: body.sort_order ?? 0,
      is_visible: true,
    })
    .select()
    .single();

  if (error) return apiError("Failed to create category: " + error.message, 500);
  return NextResponse.json({ category: data }, { status: 201 });
}