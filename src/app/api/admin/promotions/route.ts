import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError, parseBody } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

/**
 * GET /api/admin/promotions — list promotions for tenant.
 * POST /api/admin/promotions — create a promotion code.
 */
export async function GET() {
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "orders")) return apiError("Orders module disabled", 403);

  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  if (error) return apiError("Failed to load promotions", 500);
  return NextResponse.json({ promotions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;
  if (!hasModule(tenant, "orders")) return apiError("Orders module disabled", 403);

  const body = await parseBody<{
    code: string;
    description_fa?: string;
    description_en?: string;
    discount_type?: "percentage" | "fixed" | "percent";
    discount_value: number;
    min_order?: number;
    max_uses?: number;
    valid_until?: string;
    is_active?: boolean;
  }>(req);
  if (!body?.code || typeof body.discount_value !== "number") {
    return apiError("code and discount_value required", 400);
  }

  let discountType = body.discount_type ?? "percentage";
  if (discountType === "percent") discountType = "percentage";
  if (!["percentage", "fixed"].includes(discountType)) {
    return apiError("invalid discount_type", 400);
  }

  const { data, error } = await supabase
    .from("promotions")
    .insert({
      tenant_id: tenant.id,
      code: body.code.trim().toUpperCase(),
      description_fa: body.description_fa ?? null,
      description_en: body.description_en ?? null,
      discount_type: discountType,
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
