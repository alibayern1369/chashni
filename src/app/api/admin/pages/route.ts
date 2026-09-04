import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { slugify } from "@/lib/slug";
import { randomUUID } from "crypto";

/**
 * GET /api/admin/pages — list pages (with blocks) for tenant.
 * POST /api/admin/pages — create a page (optionally with default blocks).
 */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const { data: pages, error } = await supabase
    .from("pages")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("sort_order", { ascending: true });

  if (error) return apiError("Failed to load pages", 500);
  return NextResponse.json({ pages: pages ?? [] });
}

export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const body = await parseBody<{
    title_fa: string;
    title_en: string;
    slug?: string;
    description_fa?: string;
    description_en?: string;
    meta_title?: string;
    meta_description?: string;
    is_published?: boolean;
  }>(req);
  if (!body?.title_fa || !body?.title_en) return apiError("title_fa and title_en required", 400);

  const pageId = randomUUID();
  const slug = body.slug || slugify(body.title_en) + "-" + Date.now().toString(36);

  const { data: page, error } = await supabase
    .from("pages")
    .insert({
      id: pageId,
      tenant_id: tenant.id,
      slug,
      title_fa: body.title_fa,
      title_en: body.title_en,
      description_fa: body.description_fa ?? null,
      description_en: body.description_en ?? null,
      is_published: body.is_published ?? false,
      sort_order: 0,
      meta_title: body.meta_title ?? null,
      meta_description: body.meta_description ?? null,
      og_image: null,
    })
    .select()
    .single();

  if (error || !page) return apiError("Failed to create page: " + (error?.message ?? ""), 500);

  // Create default hero block so the page is editable immediately
  await supabase.from("page_blocks").insert([
    {
      page_id: pageId,
      type: "hero",
      content: {
        heading: body.title_en,
        headingFa: body.title_fa,
        subtitle: "",
        subtitleFa: "",
        imageUrl: "",
        buttonText: "",
        buttonTextFa: "",
      },
      sort_order: 0,
      is_visible: true,
    },
  ]);

  return NextResponse.json({ page }, { status: 201 });
}