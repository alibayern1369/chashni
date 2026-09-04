import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/helpers";
import { requireSuperAdmin, unauthorized } from "@/lib/api/super-admin";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * GET /api/super/stats — global platform statistics.
 * Requires super admin role.
 */
export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const svc = createServiceClient();

  const countTable = async (table: string): Promise<number> => {
    const { count, error } = await svc.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.warn(`count ${table} failed:`, error.message);
      return 0;
    }
    return count ?? 0;
  };

  const [tenants, members, orders, menuItems, categories, profiles, openOrders] =
    await Promise.all([
      countTable("tenants"),
      countTable("tenant_members"),
      countTable("orders"),
      countTable("menu_items"),
      countTable("categories"),
      countTable("profiles"),
      (async () => {
        const { count, error } = await svc
          .from("orders")
          .select("*", { count: "exact", head: true })
          .in("status", ["received", "confirmed", "preparing", "ready"]);
        if (error) return 0;
        return count ?? 0;
      })(),
    ]);

  // Revenue (sum of non-cancelled orders' totals)
  const { data: revenueRows } = await svc
    .from("orders")
    .select("total")
    .not("status", "eq", "cancelled");
  const revenue = (revenueRows ?? []).reduce((sum, row) => sum + (row.total || 0), 0);

  return NextResponse.json({
    stats: {
      tenants,
      members,
      orders,
      menuItems,
      categories,
      profiles,
      openOrders,
      revenue,
    },
  });
}