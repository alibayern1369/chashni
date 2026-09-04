import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";
import { createServiceClient } from "@/lib/supabase/service";
import type { CartItem, DBOrderType } from "@/lib/types";

interface CreateOrderBody {
  items: CartItem[];
  table?: string;
  orderType: DBOrderType;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  paymentMethod?: "online" | "cashier";
  promoCode?: string;
  deliveryAddress?: string;
}

/**
 * POST /api/orders — Create a new order.
 * Server-side pricing is NON-NEGOTIABLE: price is recomputed here from the DB.
 */
export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();

  if (!tenant) {
    return apiError("Tenant not found", 404);
  }

  if (!hasModule(tenant, "orders")) {
    return apiError("Orders module is not enabled for this tenant", 403);
  }

  const body = await parseBody<CreateOrderBody>(req);
  if (!body || !body.items || body.items.length === 0) {
    return apiError("No items in order", 400);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (hasModule(tenant, "auth") && !user) {
    return apiError("Login required to place an order", 401);
  }

  if (body.orderType === "delivery") {
    if (!hasModule(tenant, "delivery")) {
      return apiError("Delivery module is not enabled", 403);
    }
    if (!body.deliveryAddress?.trim()) {
      return apiError("Delivery address required", 400);
    }
  }

  const paymentEnabled = hasModule(tenant, "payment");
  const paymentMethod =
    body.paymentMethod === "online" && paymentEnabled ? "online" : "cashier";

  // Fetch all menu items referenced in the order with their CURRENT prices
  const menuItemIds = body.items
    .filter((i) => !i.customBurger)
    .map((i) => i.menuItemId);

  let dbItems: any[] = [];
  if (menuItemIds.length > 0) {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .in("id", menuItemIds)
      .eq("tenant_id", tenant.id)
      .eq("available", true);

    if (error) {
      return apiError("Failed to validate order items", 500);
    }
    dbItems = data ?? [];
  }

  const dbItemMap = new Map(dbItems.map((i) => [i.id, i]));

  let subtotal = 0;
  const snapshot: any[] = [];

  for (const item of body.items) {
    let unitPrice = 0;
    let nameFa = "";
    let nameEn = "";

    if (item.customBurger) {
      if (!hasModule(tenant, "builder")) {
        return apiError("Burger builder module is not enabled", 403);
      }

      const { data: components } = await supabase
        .from("burger_components")
        .select("*")
        .eq("tenant_id", tenant.id);

      const compMap = new Map(
        (components ?? []).map((c) => [c.component_id, c]),
      );

      const allIds = [
        item.customBurger.bun,
        item.customBurger.patty,
        ...item.customBurger.cheese,
        ...item.customBurger.toppings,
        ...item.customBurger.sauce,
      ];

      for (const id of allIds) {
        const comp = compMap.get(id);
        if (comp) unitPrice += comp.price;
      }

      nameFa = item.customBurger.name || "برگر سفارشی";
      nameEn = item.customBurger.name || "Custom Burger";
    } else {
      const dbItem = dbItemMap.get(item.menuItemId);
      if (!dbItem) {
        return apiError(`Item not available: ${item.menuItemId}`, 409);
      }
      unitPrice = dbItem.base_price;
      nameFa = dbItem.name_fa;
      nameEn = dbItem.name_en;

      const options = dbItem.options ?? [];
      for (const group of options) {
        const selected = item.selectedOptions?.[group.id] ?? [];
        for (const opt of group.options ?? []) {
          if (selected.includes(opt.id)) {
            unitPrice += opt.priceModifier ?? 0;
          }
        }
      }

      const extras = dbItem.extras ?? [];
      for (const ex of extras) {
        if (item.selectedExtras?.includes(ex.id)) {
          unitPrice += ex.price ?? 0;
        }
      }
    }

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    snapshot.push({
      menuItemId: item.menuItemId,
      name: nameFa || nameEn || item.menuItemId,
      nameFa,
      nameEn,
      quantity: item.quantity,
      unitPrice,
      totalPrice: lineTotal,
      selectedOptions: item.selectedOptions,
      selectedExtras: item.selectedExtras,
      customBurger: item.customBurger,
      note: item.note,
    });
  }

  let discount = 0;
  let promoCode: string | null = null;

  if (body.promoCode?.trim()) {
    const service = createServiceClient();
    const { data: promoRows, error: promoError } = await service.rpc(
      "apply_promotion",
      {
        p_tenant_id: tenant.id,
        p_code: body.promoCode.trim(),
        p_subtotal: subtotal,
      },
    );

    if (promoError) {
      return apiError(promoError.message || "Invalid promo code", 400);
    }

    const row = Array.isArray(promoRows) ? promoRows[0] : promoRows;
    if (row) {
      discount = row.discount ?? 0;
      promoCode = row.code ?? body.promoCode.trim();
    }
  }

  const total = Math.max(0, subtotal - discount);

  let tableId: string | null = null;
  if (body.table) {
    const { data: table } = await supabase
      .from("tables")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("number", parseInt(body.table, 10))
      .eq("is_active", true)
      .single();
    if (table) tableId = table.id;
  }

  let loyaltyPoints = 0;
  if (hasModule(tenant, "loyalty") && user) {
    loyaltyPoints = Math.floor(total / 10000);
  }

  const paymentStatus =
    paymentMethod === "online" ? "pending" : "unpaid";

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      tenant_id: tenant.id,
      user_id: user?.id ?? null,
      table_id: tableId,
      status: "received",
      order_type: body.orderType,
      items: snapshot,
      subtotal,
      discount,
      tax: 0,
      total,
      customer_name: body.customerName ?? null,
      customer_phone: body.customerPhone ?? null,
      notes: body.notes ?? null,
      estimated_minutes: await estimateMinutes(snapshot, supabase, tenant.id),
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      promo_code: promoCode,
      delivery_address: body.deliveryAddress ?? null,
      loyalty_points_earned: loyaltyPoints,
    })
    .select()
    .single();

  if (error || !order) {
    return apiError(error?.message || "Failed to create order", 500);
  }

  if (loyaltyPoints > 0 && user) {
    const service = createServiceClient();
    const { data: existing } = await service
      .from("loyalty_balances")
      .select("id, points")
      .eq("tenant_id", tenant.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      await service
        .from("loyalty_balances")
        .update({
          points: existing.points + loyaltyPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await service.from("loyalty_balances").insert({
        tenant_id: tenant.id,
        user_id: user.id,
        points: loyaltyPoints,
      });
    }
  }

  return NextResponse.json(
    {
      order,
      paymentRequired: paymentMethod === "online" && paymentStatus === "pending",
    },
    { status: 201 },
  );
}

/**
 * GET /api/orders?id=... — Fetch a single order (tracking).
 * Uses service role so guests can track by UUID.
 */
export async function GET(req: NextRequest) {
  const { tenant } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return apiError("Order id required", 400);

  const service = createServiceClient();
  const { data: order, error } = await service
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .single();

  if (error || !order) return apiError("Order not found", 404);

  return NextResponse.json({ order });
}

async function estimateMinutes(
  snapshot: any[],
  supabase: Awaited<ReturnType<typeof getTenantFromRequest>>["supabase"],
  tenantId: string,
): Promise<number | null> {
  const menuItemIds = snapshot.map((s) => s.menuItemId).filter(Boolean);
  if (menuItemIds.length === 0) return 15;

  const { data } = await supabase
    .from("menu_items")
    .select("preparation_time")
    .in("id", menuItemIds)
    .eq("tenant_id", tenantId);

  if (!data || data.length === 0) return 15;
  return Math.max(...data.map((d) => d.preparation_time || 10), 10);
}
