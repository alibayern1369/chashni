import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";
import { createServiceClient } from "@/lib/supabase/service";
import { menuItems as staticMenuItems } from "@/lib/data";
import { calculateCustomBurgerPrice, normalizeCustomBurger } from "@/lib/utils";
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
    .filter((i) => i.menuItemId !== "custom-burger" && !i.customBurger)
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

    // Also try slug match for catalog IDs that are not DB UUIDs
    const missing = menuItemIds.filter((id) => !dbItems.some((d) => d.id === id));
    if (missing.length > 0) {
      const staticSlugs = missing
        .map((id) => staticMenuItems.find((m) => m.id === id)?.slug)
        .filter(Boolean) as string[];
      if (staticSlugs.length > 0) {
        const { data: bySlug } = await supabase
          .from("menu_items")
          .select("*")
          .in("slug", staticSlugs)
          .eq("tenant_id", tenant.id)
          .eq("available", true);
        if (bySlug?.length) dbItems = [...dbItems, ...bySlug];
      }
    }
  }

  const dbItemMap = new Map(dbItems.map((i) => [i.id, i]));
  const dbItemBySlug = new Map(dbItems.map((i) => [i.slug, i]));

  let subtotal = 0;
  const snapshot: any[] = [];

  for (const item of body.items) {
    let unitPrice = 0;
    let nameFa = "";
    let nameEn = "";

    if (item.menuItemId === "custom-burger" || item.customBurger) {
      const burger = normalizeCustomBurger(item.customBurger);

      const { data: components } = await supabase
        .from("burger_components")
        .select("*")
        .eq("tenant_id", tenant.id);

      const compMap = new Map(
        (components ?? []).map((c) => [c.component_id, c]),
      );

      const allIds = [
        burger.bun,
        burger.patty,
        ...burger.cheese,
        ...burger.toppings,
        ...burger.sauce,
      ].filter(Boolean);

      let fromDb = 0;
      let matched = 0;
      for (const id of allIds) {
        const comp = compMap.get(id);
        if (comp) {
          fromDb += Number(comp.price) || 0;
          matched += 1;
        }
      }

      // Prefer catalog pricing when DB components are incomplete (Namakdan static builder)
      unitPrice =
        matched > 0 && matched === allIds.length
          ? fromDb
          : calculateCustomBurgerPrice(burger);

      nameFa = burger.name || "برگر سفارشی نمکدان";
      nameEn = burger.name || "Namakdan Custom Burger";
      item.customBurger = burger;
    } else {
      let dbItem = dbItemMap.get(item.menuItemId);
      if (!dbItem) {
        const staticItem = staticMenuItems.find((m) => m.id === item.menuItemId);
        if (staticItem) dbItem = dbItemBySlug.get(staticItem.slug);
      }

      if (dbItem) {
        if (dbItem.stock_qty != null && dbItem.stock_qty < (item.quantity || 1)) {
          return apiError(
            `Insufficient stock for ${dbItem.name_en || dbItem.name_fa}`,
            400,
          );
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
      } else {
        // Fallback: static catalog (demo / incomplete seed)
        const staticItem = staticMenuItems.find((m) => m.id === item.menuItemId);
        if (!staticItem || !staticItem.available) {
          return apiError(`Item not available: ${item.menuItemId}`, 409);
        }
        unitPrice = staticItem.basePrice;
        nameFa = staticItem.nameFa;
        nameEn = staticItem.nameEn;

        for (const group of staticItem.options) {
          const selected = item.selectedOptions?.[group.id] ?? [];
          for (const opt of group.options) {
            if (selected.includes(opt.id)) unitPrice += opt.priceModifier;
          }
        }
        for (const ex of staticItem.extras) {
          if (item.selectedExtras?.includes(ex.id)) unitPrice += ex.price;
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

  // Prefer service role (bypasses RLS). Without it, fall back to the request
  // client and insert as guest (user_id null) so orders_insert_anon passes —
  // logged-in customers otherwise hit RLS because that policy requires user_id IS NULL.
  let writer = supabase;
  let useServiceRole = false;
  try {
    writer = createServiceClient();
    useServiceRole = true;
  } catch {
    useServiceRole = false;
  }

  const { data: order, error } = await writer
    .from("orders")
    .insert({
      tenant_id: tenant.id,
      user_id: useServiceRole ? user?.id ?? null : null,
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
      loyalty_points_earned: useServiceRole ? loyaltyPoints : 0,
    })
    .select()
    .single();

  if (error || !order) {
    const msg = error?.message || "Failed to create order";
    if (/row level security|rls/i.test(msg)) {
      return apiError(
        "ثبت سفارش به خاطر محدودیت امنیتی دیتابیس ناموفق بود. SUPABASE_SERVICE_ROLE_KEY را در Vercel تنظیم کنید یا migration 006 را در Supabase اجرا کنید.",
        500,
      );
    }
    return apiError(msg, 500);
  }

  // Best-effort stock decrement for tracked items
  try {
    const stockWriter = useServiceRole ? createServiceClient() : writer;
    for (const item of body.items) {
      if (item.menuItemId === "custom-burger" || item.customBurger) continue;
      let dbItem = dbItemMap.get(item.menuItemId);
      if (!dbItem) {
        const staticItem = staticMenuItems.find((m) => m.id === item.menuItemId);
        if (staticItem) dbItem = dbItemBySlug.get(staticItem.slug);
      }
      if (!dbItem || dbItem.stock_qty == null) continue;
      const next = Math.max(0, Number(dbItem.stock_qty) - (item.quantity || 1));
      await stockWriter
        .from("menu_items")
        .update({
          stock_qty: next,
          available: next > 0 ? dbItem.available : false,
        })
        .eq("id", dbItem.id)
        .eq("tenant_id", tenant.id);
    }
  } catch {
    /* ignore stock errors — order already placed */
  }

  if (loyaltyPoints > 0 && user && useServiceRole) {
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
