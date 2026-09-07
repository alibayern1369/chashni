import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError, parseBody } from "@/lib/api/helpers";
import { randomUUID } from "crypto";
import { hasModule } from "@/lib/supabase/modules";

/**
 * GET /api/admin/tables — list tables for tenant.
 * POST /api/admin/tables — create a table (number/name/capacity).
 */
export async function GET() {
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "tables")) return apiError("Tables module disabled", 403);

  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("number", { ascending: true });

  if (error) return apiError("Failed to load tables", 500);
  return NextResponse.json({ tables: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "tables")) return apiError("Tables module disabled", 403);

  const body = await parseBody<{
    number: number;
    name?: string;
    capacity?: number;
  }>(req);
  if (typeof body?.number !== "number" || body.number < 1) {
    return apiError("valid table number required", 400);
  }

  const { data, error } = await supabase
    .from("tables")
    .insert({
      tenant_id: tenant.id,
      number: body.number,
      name: body.name ?? null,
      capacity: body.capacity ?? 4,
      qr_token: randomUUID(),
      is_active: true,
    })
    .select()
    .single();

  if (error) return apiError("Failed to create table: " + error.message, 500);
  return NextResponse.json({ table: data }, { status: 201 });
}
