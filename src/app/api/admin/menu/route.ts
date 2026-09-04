import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError, parseBody } from "@/lib/api/helpers";
import { slugify } from "@/lib/slug";

interface MenuItemInput {
  category_id: string;
  name_fa: string;
  name_en: string;
  desc_fa?: string;
  desc_en?: string;
  base_price?: number;
  image?: string;
  calories?: number;
  preparation_time?: number;
  spicy_level?: number;
  is_vegetarian?: boolean;
  is_bestseller?: boolean;
  is_new?: boolean;
  is_chef_pick?: boolean;
  ingredients_fa?: string[];
  ingredients_en?: string[];
  allergens_fa?: string[];
  allergens_en?: string[];
  available?: boolean;
}

function toDBInput(body: MenuItemInput, tenantId: string) {
  const ingredients = (body.ingredients_fa ?? []).map((fa, i) => ({
    fa,
    en: body.ingredients_en?.[i] ?? "",
  }));
  const allergens = (body.allergens_fa ?? []).map((fa, i) => ({
    fa,
    en: body.allergens_en?.[i] ?? "",
  }));
  return {
    tenant_id: tenantId,
    category_id: body.category_id,
    slug: slugify(body.name_en) + "-" + Date.now().toString(36),
    name_fa: body.name_fa,
    name_en: body.name_en,
    desc_fa: body.desc_fa ?? "",
    desc_en: body.desc_en ?? "",
    base_price: body.base_price ?? 0,
    image: body.image ?? null,
    calories: body.calories ?? 0,
    rating: 0,
    review_count: 0,
    preparation_time: body.preparation_time ?? 15,
    spicy_level: body.spicy_level ?? 0,
    is_vegetarian: body.is_vegetarian ?? false,
    is_bestseller: body.is_bestseller ?? false,
    is_new: body.is_new ?? false,
    is_chef_pick: body.is_chef_pick ?? false,
    ingredients,
    allergens,
    options: [],
    extras: [],
    available: body.available ?? true,
    sort_order: 0,
  };
}

/**
 * GET /api/admin/menu — list all items (with category info) for tenant.
 * POST /api/admin/menu — create a menu item.
 */
export async function GET() {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const { data, error } = await supabase
    .from("menu_items")
    .select("*, categories:category_id(id, slug, name_fa, name_en)")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  if (error) return apiError("Failed to load menu items", 500);
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("Authentication required", 401);

  const body = await parseBody<MenuItemInput>(req);
  if (!body?.category_id || !body?.name_fa || !body?.name_en) {
    return apiError("category_id, name_fa, name_en required", 400);
  }

  const { data, error } = await supabase
    .from("menu_items")
    .insert(toDBInput(body, tenant.id))
    .select()
    .single();

  if (error) return apiError("Failed to create menu item: " + error.message, 500);
  return NextResponse.json({ item: data }, { status: 201 });
}