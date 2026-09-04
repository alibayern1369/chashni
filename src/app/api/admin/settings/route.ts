import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";

/**
 * GET /api/admin/settings — tenant profile + settings for editing.
 * PATCH /api/admin/settings — update tenant profile/settings.
 * RLS: only tenant owner/admin can update tenants (tenants_owner_update), but
 * tenant members can read. We gate writes via RLS.
 */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const { data: settings } = await supabase
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", tenant.id);

  return NextResponse.json({ tenant, settings: settings ?? [] });
}

export async function PATCH(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

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
      const msg = "Failed to update tenant (owner/admin only): " + error.message;
      return apiError(msg, 403);
    }
  }

  if (typeof body.settings === "object" && body.settings !== null) {
    const settings = body.settings as Record<string, unknown>;
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("tenant_settings").upsert(
        { tenant_id: tenant.id, key, value },
        { onConflict: "tenant_id,key" },
      );
    }
  }

  const { data: updated } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenant.id)
    .single();

  return NextResponse.json({ tenant: updated });
}