import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
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

/**
 * POST /api/orders/status — Update order status.
 * Requires authentication + tenant membership (enforced by RLS + this check).
 */
export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();

  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "orders")) return apiError("Orders module disabled", 403);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return apiError("Authentication required", 401);

  const body = await parseBody<{
    orderId: string;
    status: DBOrderStatus;
  }>(req);

  if (!body?.orderId || !VALID_STATUSES.includes(body.status)) {
    return apiError("Invalid order id or status", 400);
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
