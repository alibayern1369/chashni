import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

/**
 * GET /api/tables/resolve?token=... — Resolve QR token to table number.
 * Public; used by /{locale}/qr/{token}.
 */
export async function GET(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "tables") && !hasModule(tenant, "menu")) {
    return apiError("Tables module disabled", 403);
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token) return apiError("Token required", 400);

  const { data: table, error } = await supabase
    .from("tables")
    .select("id, number, name, qr_token, is_active")
    .eq("tenant_id", tenant.id)
    .eq("qr_token", token)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !table) return apiError("Table not found", 404);

  return NextResponse.json({ table });
}
