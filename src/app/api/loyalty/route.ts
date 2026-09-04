import { NextResponse } from "next/server";
import { getTenantFromRequest, apiError } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

/** GET /api/loyalty — current user's loyalty points for tenant */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "loyalty")) {
    return NextResponse.json({ enabled: false, points: 0 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ enabled: true, points: 0 });

  const { data } = await supabase
    .from("loyalty_balances")
    .select("points")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ enabled: true, points: data?.points ?? 0 });
}
