import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { hasModule } from "@/lib/supabase/modules";

/**
 * GET /api/favorites — list favorite menu item ids for current user.
 * POST /api/favorites — { menuItemId } toggle/add
 * DELETE /api/favorites?menuItemId=
 */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "favorites")) {
    return NextResponse.json({ favorites: [], enabled: false });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ favorites: [], enabled: true });

  const { data, error } = await supabase
    .from("favorites")
    .select("menu_item_id")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id);

  if (error) return apiError("Failed to load favorites", 500);
  return NextResponse.json({
    enabled: true,
    favorites: (data ?? []).map((r) => r.menu_item_id),
  });
}

export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  if (!hasModule(tenant, "favorites")) return apiError("Favorites disabled", 403);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const body = await parseBody<{ menuItemId: string }>(req);
  if (!body?.menuItemId) return apiError("menuItemId required", 400);

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("menu_item_id", body.menuItemId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    return NextResponse.json({ favorited: false });
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    menu_item_id: body.menuItemId,
    tenant_id: tenant.id,
  });

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ favorited: true });
}

export async function DELETE(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const menuItemId = req.nextUrl.searchParams.get("menuItemId");
  if (!menuItemId) return apiError("menuItemId required", 400);

  await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("menu_item_id", menuItemId)
    .eq("tenant_id", tenant.id);

  return NextResponse.json({ favorited: false });
}
