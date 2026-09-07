import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

/**
 * GET /api/admin/orders — List orders for the current tenant (admin/kitchen).
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdminApi("kitchen");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;

  if (!hasModule(tenant, "orders")) return apiError("Orders module disabled", 403);

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
