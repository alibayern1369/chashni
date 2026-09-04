import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";
import { createServiceClient } from "@/lib/supabase/service";
import { getPaymentProvider } from "@/lib/payments";

/**
 * POST /api/payments/zarinpal/request — Start Zarinpal payment for an order.
 */
export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "payment")) return apiError("Payment module disabled", 403);

  const body = await parseBody<{ orderId: string }>(req);
  if (!body?.orderId) return apiError("orderId required", 400);

  const service = createServiceClient();
  const { data: order } = await service
    .from("orders")
    .select("*")
    .eq("id", body.orderId)
    .eq("tenant_id", tenant.id)
    .single();

  if (!order) return apiError("Order not found", 404);
  if (order.payment_status === "paid") return apiError("Order already paid", 400);

  const { data: settingsRows } = await supabase
    .from("tenant_settings")
    .select("key, value")
    .eq("tenant_id", tenant.id)
    .eq("key", "payment");

  const paymentSettings = (settingsRows?.[0]?.value ?? {}) as Record<string, string>;
  const merchantId =
    paymentSettings.zarinpal_merchant_id ||
    process.env.ZARINPAL_MERCHANT_ID ||
    "";

  if (!merchantId) {
    return apiError("Zarinpal merchant ID is not configured", 400);
  }

  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.nextUrl.origin;

  const callbackUrl = `${base.replace(/\/+$/, "")}/api/payments/zarinpal/callback?orderId=${order.id}&tenant=${tenant.slug}`;

  try {
    const provider = getPaymentProvider("zarinpal", merchantId);
    const result = await provider.request({
      amount: order.total,
      description: `Order #${order.order_number} — ${tenant.name_en}`,
      callbackUrl,
      metadata: {
        order_id: order.id,
        mobile: order.customer_phone || "",
      },
    });

    await service
      .from("orders")
      .update({
        payment_status: "pending",
        payment_method: "online",
        payment_ref: result.authority,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return NextResponse.json({
      paymentUrl: result.paymentUrl,
      authority: result.authority,
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Payment request failed", 502);
  }
}
