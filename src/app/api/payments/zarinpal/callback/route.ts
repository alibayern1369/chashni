import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getPaymentProvider } from "@/lib/payments";

/**
 * GET /api/payments/zarinpal/callback — Zarinpal return URL.
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  const tenantSlug = req.nextUrl.searchParams.get("tenant") || "chashni";
  const authority = req.nextUrl.searchParams.get("Authority");
  const status = req.nextUrl.searchParams.get("Status");

  const locale = "fa";
  const base = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

  if (!orderId || !authority) {
    return NextResponse.redirect(`${base}/${locale}/checkout?pay=error`);
  }

  const service = createServiceClient();
  const { data: order } = await service
    .from("orders")
    .select("*, tenants!inner(slug)")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.redirect(`${base}/${locale}/checkout?pay=missing`);
  }

  if (status !== "OK") {
    await service
      .from("orders")
      .update({ payment_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", orderId);
    return NextResponse.redirect(
      `${base}/${locale}/order/${orderId}?pay=failed`,
    );
  }

  const { data: settingsRows } = await service
    .from("tenant_settings")
    .select("value")
    .eq("tenant_id", order.tenant_id)
    .eq("key", "payment")
    .maybeSingle();

  const paymentSettings = (settingsRows?.value ?? {}) as Record<string, string>;
  const merchantId =
    paymentSettings.zarinpal_merchant_id ||
    process.env.ZARINPAL_MERCHANT_ID ||
    "";

  if (!merchantId) {
    return NextResponse.redirect(`${base}/${locale}/order/${orderId}?pay=config`);
  }

  try {
    const provider = getPaymentProvider("zarinpal", merchantId);
    const verified = await provider.verify({
      amount: order.total,
      authority,
    });

    if (!verified.ok) {
      await service
        .from("orders")
        .update({ payment_status: "failed", updated_at: new Date().toISOString() })
        .eq("id", orderId);
      return NextResponse.redirect(
        `${base}/${locale}/order/${orderId}?pay=failed`,
      );
    }

    await service
      .from("orders")
      .update({
        payment_status: "paid",
        payment_ref: verified.refId || authority,
        status: order.status === "received" ? "confirmed" : order.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return NextResponse.redirect(
      `${base}/${locale}/order/success?id=${orderId}&pay=ok&tenant=${tenantSlug}`,
    );
  } catch {
    return NextResponse.redirect(
      `${base}/${locale}/order/${orderId}?pay=error`,
    );
  }
}
