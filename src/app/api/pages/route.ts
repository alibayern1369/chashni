import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

/**
 * GET /api/pages?slug=home — public published page + blocks (CMS module).
 */
export async function GET(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "cms")) {
    return NextResponse.json({ enabled: false, page: null });
  }

  const slug = req.nextUrl.searchParams.get("slug") || "home";

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) return apiError("Failed to load page", 500);
  if (!page) return NextResponse.json({ enabled: true, page: null, blocks: [] });

  const { data: blocks } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  return NextResponse.json({
    enabled: true,
    page,
    blocks: blocks ?? [],
  });
}
