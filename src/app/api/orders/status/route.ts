import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { requireTenantAccess } from "@/lib/api/admin-auth";
import { hasModule } from "@/lib/supabase/modules";
import type { DBOrderStatus } from "@/lib/types";

const VALID_STATUSES: DBOrderStatus[] = [
  "received",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
];

/** Allowed forward transitions (+ cancel from non-terminal) */
const ALLOWED: Record<DBOrderStatus, DBOrderStatus[]> = {
  received: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served", "completed", "cancelled"],
  served: ["completed"],
  completed: [],
  cancelled: [],
};

/**
 * POST /api/orders/status — Update order status with FSM validation.
 */
export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();

  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "orders")) return apiError("Orders module disabled", 403);

  const access = await requireTenantAccess(tenant, "kitchen");
  if ("error" in access) return access.error;

  const body = await parseBody<{
    orderId: string;
    status: DBOrderStatus;
  }>(req);

  if (!body?.orderId || !VALID_STATUSES.includes(body.status)) {
    return apiError("Invalid order id or status", 400);
  }

  const { data: current, error: fetchError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", body.orderId)
    .eq("tenant_id", tenant.id)
    .single();

  if (fetchError || !current) return apiError("Order not found", 404);

  const from = current.status as DBOrderStatus;
  const allowed = ALLOWED[from] ?? [];
  if (!allowed.includes(body.status)) {
    return apiError(`Invalid transition ${from} → ${body.status}`, 400);
  }

  const update: Partial<Record<string, unknown>> = {
    status: body.status,
    updated_at: new Date().toISOString(),
  };

  if (body.status === "completed") {
    update.completed_at = new Date().toISOString();
  }

  const { data: order, error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", body.orderId)
    .eq("tenant_id", tenant.id)
    .select()
    .single();

  if (error || !order) {
    return apiError("Failed to update order — insufficient permissions or not found", 403);
  }

  return NextResponse.json({ order });
}
