import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";
import type { CartItem } from "@/lib/types";

interface CreateOrderBody {
  items: CartItem[];
  table?: string;
  orderType: "dine-in" | "takeaway";
  customerName?: string;
  customerPhone?: string;
  notes?: string;
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

  // Recompute prices server-side. Reject if any referenced item is unavailable.
  let subtotal = 0;
  const snapshot: any[] = [];

  for (const item of body.items) {
    let unitPrice = 0;

    if (item.customBurger) {
      // Custom burger: price from loaded burger_components
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
    } else {
      const dbItem = dbItemMap.get(item.menuItemId);
      if (!dbItem) {
        return apiError(`Item not available: ${item.menuItemId}`, 409);
      }
      unitPrice = dbItem.base_price;

      // Add option price modifiers
      const options = dbItem.options ?? [];
      for (const group of options) {
        const selected = item.selectedOptions?.[group.id] ?? [];
        for (const opt of group.options ?? []) {
          if (selected.includes(opt.id)) {
            unitPrice += opt.priceModifier ?? 0;
          }
        }
      }

      // Add extras
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
      name: body.items.length ? undefined : item.menuItemId,
      quantity: item.quantity,
      unitPrice,
      totalPrice: lineTotal,
      selectedOptions: item.selectedOptions,
      selectedExtras: item.selectedExtras,
      customBurger: item.customBurger,
      note: item.note,
    });
  }

  // Resolve table id if provided
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

  // Get authenticated user (optional — anonymous orders allowed for QR ordering)
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      discount: 0,
      tax: 0,
      total: subtotal,
      customer_name: body.customerName ?? null,
      customer_phone: body.customerPhone ?? null,
      notes: body.notes ?? null,
      estimated_minutes: await estimateMinutes(snapshot, supabase, tenant.id),
    })
    .select()
    .single();

  if (error || !order) {
    return apiError("Failed to create order", 500);
  }

  return NextResponse.json({ order }, { status: 201 });
}

/**
 * GET /api/orders?id=... — Fetch a single order.
 */
export async function GET(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return apiError("Order id required", 400);

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .single();

  if (error || !order) return apiError("Order not found", 404);

  return NextResponse.json({ order });
}

/**
 * Estimate preparation minutes (max across items).
 */
async function estimateMinutes(
  snapshot: any[],
  supabase: Awaited<ReturnType<typeof getTenantFromRequest>>["supabase"],
  tenantId: string,
): Promise<number | null> {
  const menuItemIds = snapshot
    .map((s) => s.menuItemId)
    .filter(Boolean);
  if (menuItemIds.length === 0) return null;

  const { data } = await supabase
    .from("menu_items")
    .select("preparation_time")
    .in("id", menuItemIds)
    .eq("tenant_id", tenantId);

  if (!data || data.length === 0) return null;
  return Math.max(...data.map((d) => d.preparation_time));
}
