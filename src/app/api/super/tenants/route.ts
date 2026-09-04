import { NextRequest, NextResponse } from "next/server";
import { apiError, parseBody } from "@/lib/api/helpers";
import { requireSuperAdmin, unauthorized } from "@/lib/api/super-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { randomUUID } from "crypto";

/**
 * GET /api/super/tenants — list all tenants with summary counts.
 * PATCH /api/super/tenants — update a tenant (is_active, enabled_modules, etc.)
 * Requires super admin role.
 */
export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const svc = createServiceClient();
  const { data: tenants, error } = await svc
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return apiError("Failed to fetch tenants", 500);

  return NextResponse.json({ tenants: tenants ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const body = await parseBody<{
    name_fa: string;
    name_en: string;
    slug: string;
    enabled_modules?: string[];
  }>(req);
  if (!body?.name_fa || !body?.name_en || !body?.slug) {
    return apiError("name_fa, name_en, slug required", 400);
  }

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("tenants")
    .insert({
      id: randomUUID(),
      name_fa: body.name_fa,
      name_en: body.name_en,
      slug: body.slug,
      enabled_modules: body.enabled_modules ?? ["menu", "orders", "auth", "qr"],
      is_active: true,
      currency: "IRR",
      timezone: "Asia/Tehran",
      primary_color: "#f59e0b",
    })
    .select()
    .single();

  if (error) return apiError("Failed to create tenant: " + error.message, 500);

  return NextResponse.json({ tenant: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const body = await parseBody<{
    id: string;
    is_active?: boolean;
    enabled_modules?: string[];
    name_fa?: string;
    name_en?: string;
    slug?: string;
    primary_color?: string;
    currency?: string;
  }>(req);
  if (!body?.id) return apiError("tenant id required", 400);

  const updates: Record<string, unknown> = {};
  if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
  if (Array.isArray(body.enabled_modules)) updates.enabled_modules = body.enabled_modules;
  if (body.name_fa !== undefined) updates.name_fa = body.name_fa;
  if (body.name_en !== undefined) updates.name_en = body.name_en;
  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.primary_color !== undefined) updates.primary_color = body.primary_color;
  if (body.currency !== undefined) updates.currency = body.currency;

  if (Object.keys(updates).length === 0) return apiError("no updates provided", 400);

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("tenants")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return apiError("Failed to update tenant: " + error.message, 500);

  return NextResponse.json({ tenant: data });
}
