import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

/**
 * GET /api/admin/stats?range=today|7d|30d
 * Operational dashboard + reports summary.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdminApi("kitchen");
  if ("error" in auth) return auth.error;
  const { tenant, supabase, access } = auth;

  if (!hasModule(tenant, "orders")) return apiError("Orders module disabled", 403);

  // Kitchen role: limited stats (active queue only)
  const range = req.nextUrl.searchParams.get("range") || "today";
  const now = new Date();
  let from = new Date(now);
  if (range === "7d") from.setDate(from.getDate() - 7);
  else if (range === "30d") from.setDate(from.getDate() - 30);
  else {
    from.setHours(0, 0, 0, 0);
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, total, payment_status, items, created_at, completed_at")
    .eq("tenant_id", tenant.id)
    .gte("created_at", from.toISOString())
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) return apiError("Failed to load stats", 500);

  const list = orders ?? [];
  const byStatus: Record<string, number> = {};
  let sales = 0;
  let paidSales = 0;
  let completed = 0;
  let cancelled = 0;
  const itemCounts = new Map<string, { name: string; qty: number; revenue: number }>();

  for (const o of list) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    if (o.status === "cancelled") {
      cancelled += 1;
      continue;
    }
    sales += Number(o.total) || 0;
    if (o.payment_status === "paid") paidSales += Number(o.total) || 0;
    if (o.status === "completed") completed += 1;

    const items = Array.isArray(o.items) ? o.items : [];
    for (const it of items) {
      const name = it.name || it.menuItemId || "item";
      const key = String(it.menuItemId || name);
      const prev = itemCounts.get(key) ?? { name, qty: 0, revenue: 0 };
      prev.qty += Number(it.quantity) || 0;
      prev.revenue += Number(it.totalPrice) || 0;
      itemCounts.set(key, prev);
    }
  }

  const topItems = [...itemCounts.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  const activeStatuses = ["received", "confirmed", "preparing", "ready", "served"];
  const activeCount = activeStatuses.reduce((n, s) => n + (byStatus[s] ?? 0), 0);

  return NextResponse.json({
    range,
    from: from.toISOString(),
    role: access.role,
    summary: {
      orderCount: list.length,
      activeCount,
      completed,
      cancelled,
      sales,
      paidSales,
      avgTicket: list.length > 0 ? Math.round(sales / Math.max(1, list.length - cancelled)) : 0,
    },
    byStatus,
    topItems,
  });
}
