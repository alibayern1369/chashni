import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

/**
 * GET /api/admin/orders — List orders for the current tenant (admin).
 * Requires authentication + tenant membership (enforced by RLS).
 */
export async function GET(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();

  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "orders")) return apiError("Orders module disabled", 403);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return apiError("Authentication required", 401);

  const status = req.nextUrl.searchParams.get("status");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "100", 10);

  let query = supabase
    .from("orders")
    .select("*, table:tables(id, number, name)")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(Math.min(limit, 500));

  if (status) {
    query = query.eq("status", status);
  }

  const { data: orders, error } = await query;

  if (error) return apiError("Failed to fetch orders", 500);

  return NextResponse.json({ orders: orders ?? [] });
}
