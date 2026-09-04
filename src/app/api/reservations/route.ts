import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { requireTenantAccess } from "@/lib/api/admin-auth";
import { hasModule } from "@/lib/supabase/modules";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      tenant_id: tenant.id,
      guest_name: body.guest_name,
      guest_phone: body.guest_phone ?? null,
      party_size: body.party_size ?? 2,
      reserved_at: body.reserved_at,
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
