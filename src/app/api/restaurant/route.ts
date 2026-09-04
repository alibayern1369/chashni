import { NextResponse } from "next/server";
import { getTenantFromRequest, apiError } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

/**
 * GET /api/restaurant — Fetch restaurant info/settings for the current tenant.
 */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();

  if (!tenant) {
    return apiError("Tenant not found", 404);
  }

  const { data: settings } = await supabase
    .from("tenant_settings")
    .select("*")
    .eq("tenant_id", tenant.id);

  const settingsMap: Record<string, unknown> = {};
  settings?.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return NextResponse.json({
    tenant,
    settings: settingsMap,
  });
}
