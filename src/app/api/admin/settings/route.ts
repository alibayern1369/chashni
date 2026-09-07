import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError, parseBody } from "@/lib/api/helpers";

/**
 * GET /api/admin/settings — tenant profile + settings for editing.
 * PATCH /api/admin/settings — update tenant profile/settings (owner/admin).
 */
export async function GET() {
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase, access } = auth;

  const { data: settings } = await supabase
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", tenant.id);

  const canManage =
    access.isSuperAdmin || access.role === "owner" || access.role === "admin";

  return NextResponse.json({
    tenant,
    settings: settings ?? [],
    canManage,
    role: access.role,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminApi("manage");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;

  const body = await parseBody<Record<string, unknown>>(req);
  if (!body) return apiError("Invalid body", 400);

  const tenantFields = [
    "name_fa",
    "name_en",
    "slogan_fa",
    "slogan_en",
    "phone",
    "address_fa",
    "address_en",
    "logo_url",
    "favicon_url",
    "primary_color",
    "timezone",
    "currency",
  ];

  const updates: Record<string, unknown> = {};
  for (const key of tenantFields) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("tenants")
      .update(updates)
      .eq("id", tenant.id);
    if (error) {
      return apiError("Failed to update tenant: " + error.message, 403);
    }
  }

  if (typeof body.settings === "object" && body.settings !== null) {
    const settings = body.settings as Record<string, unknown>;
    for (const [key, value] of Object.entries(settings)) {
      const { error } = await supabase.from("tenant_settings").upsert(
        { tenant_id: tenant.id, key, value },
        { onConflict: "tenant_id,key" },
      );
      if (error) return apiError("Failed to update settings: " + error.message, 500);
    }
  }

  const { data: updated } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenant.id)
    .single();

  return NextResponse.json({ tenant: updated });
}
