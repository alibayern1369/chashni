import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { randomUUID } from "crypto";

/**
 * GET /api/admin/promotions — list promotions for tenant.
 * POST /api/admin/promotions — create a promotion code.
 */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  if (error) return apiError("Failed to load promotions", 500);
  return NextResponse.json({ promotions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const body = await parseBody<{
    code: string;
    description_fa?: string;
    description_en?: string;
    discount_type?: "percent" | "fixed";
    discount_value: number;
    min_order?: number;
    max_uses?: number;
    valid_until?: string;
    is_active?: boolean;
  }>(req);
  if (!body?.code || typeof body.discount_value !== "number") {
    return apiError("code and discount_value required", 400);
  }
  if (!["percentage", "fixed"].includes(body.discount_type ?? "percentage")) {
    return apiError("invalid discount_type", 400);
  }

  const { data, error } = await supabase
    .from("promotions")
    .insert({
      tenant_id: tenant.id,
      code: body.code.trim().toUpperCase(),
      description_fa: body.description_fa ?? null,
      description_en: body.description_en ?? null,
      discount_type: body.discount_type ?? "percentage",
      discount_value: body.discount_value,
      min_order: body.min_order ?? 0,
      max_uses: body.max_uses ?? null,
      used_count: 0,
      valid_from: null,
      valid_until: body.valid_until ?? null,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) return apiError("Failed to create promotion: " + error.message, 500);
  return NextResponse.json({ promotion: data }, { status: 201 });
}