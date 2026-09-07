import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { requireTenantAccess } from "@/lib/api/admin-auth";
import { hasModule } from "@/lib/supabase/modules";

const VALID_STATUSES = ["pending", "confirmed", "seated", "cancelled", "no_show"] as const;

export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "reservations")) return apiError("Reservations disabled", 403);

  const access = await requireTenantAccess(tenant, "write");
  if ("error" in access) return access.error;

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("reserved_at", { ascending: true })
    .limit(200);

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ reservations: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "reservations")) return apiError("Reservations disabled", 403);

  const body = await parseBody<{
    guest_name: string;
    guest_phone?: string;
    party_size?: number;
    reserved_at: string;
    table_id?: string;
    notes?: string;
  }>(req);

  if (!body?.guest_name || !body?.reserved_at) {
    return apiError("guest_name and reserved_at required", 400);
  }

  const guestName = body.guest_name.trim();
  if (guestName.length < 2) return apiError("guest_name too short", 400);

  const partySize = body.party_size ?? 2;
  if (partySize < 1 || partySize > 50) return apiError("party_size must be 1–50", 400);

  const reservedAt = new Date(body.reserved_at);
  if (Number.isNaN(reservedAt.getTime())) return apiError("invalid reserved_at", 400);

  // Reject dates more than 1 day in the past (clock skew) or > 1 year ahead
  const now = Date.now();
  if (reservedAt.getTime() < now - 24 * 60 * 60 * 1000) {
    return apiError("reserved_at must be in the future", 400);
  }
  if (reservedAt.getTime() > now + 365 * 24 * 60 * 60 * 1000) {
    return apiError("reserved_at too far in the future", 400);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      tenant_id: tenant.id,
      guest_name: guestName,
      guest_phone: body.guest_phone?.trim() || null,
      party_size: partySize,
      reserved_at: reservedAt.toISOString(),
      table_id: body.table_id ?? null,
      notes: body.notes ?? null,
      user_id: user?.id ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ reservation: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "reservations")) return apiError("Reservations disabled", 403);

  const access = await requireTenantAccess(tenant, "write");
  if ("error" in access) return access.error;

  const body = await parseBody<{ id: string; status: string }>(req);
  if (!body?.id || !body?.status) return apiError("id and status required", 400);
  if (!VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])) {
    return apiError("invalid status", 400);
  }

  const { data, error } = await supabase
    .from("reservations")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", body.id)
    .eq("tenant_id", tenant.id)
    .select()
    .single();

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ reservation: data });
}
