import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError } from "@/lib/api/helpers";

/**
 * GET /api/orders/my — List the authenticated user's orders (across the
 * resolved tenant). Requires auth.
 */
export async function GET(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "50", 10);

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(Math.min(limit, 200));

  if (error) return apiError("Failed to load orders", 500);
  return NextResponse.json({ orders: data ?? [] });
}