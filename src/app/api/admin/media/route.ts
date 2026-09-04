import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";

/**
 * GET /api/admin/media — list media for tenant.
 * POST /api/admin/media — save a media entry (URL-based upload to storage
 * handled separately; this stores the reference + alt text).
 */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return apiError("Failed to load media", 500);
  return NextResponse.json({ media: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const body = await parseBody<{
    file_url: string;
    file_name: string;
    file_type?: string;
    file_size?: number;
    alt_text?: string;
  }>(req);
  if (!body?.file_url || !body?.file_name) return apiError("file_url and file_name required", 400);

  const { data, error } = await supabase
    .from("media")
    .insert({
      tenant_id: tenant.id,
      file_name: body.file_name,
      file_url: body.file_url,
      file_type: body.file_type ?? null,
      file_size: body.file_size ?? null,
      alt_text: body.alt_text ?? null,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) return apiError("Failed to save media: " + error.message, 500);
  return NextResponse.json({ media: data }, { status: 201 });
}