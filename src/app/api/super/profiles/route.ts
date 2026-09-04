import { NextRequest, NextResponse } from "next/server";
import { apiError, parseBody } from "@/lib/api/helpers";
import { requireSuperAdmin, unauthorized } from "@/lib/api/super-admin";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * GET /api/super/profiles — list all profiles (optionally filter by search)
 * PATCH /api/super/profiles/:id — update role / is_active
 * Requires super admin role.
 */
export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const svc = createServiceClient();
  const { data: profiles, error } = await svc
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return apiError("Failed to fetch profiles: " + error.message, 500);

  return NextResponse.json({ profiles: profiles ?? [] });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const body = await parseBody<{
    id: string;
    role?: string;
    is_active?: boolean;
  }>(req);
  if (!body?.id) return apiError("profile id required", 400);

  const updates: Record<string, unknown> = {};
  if (body.role !== undefined) updates.role = body.role;
  if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

  if (Object.keys(updates).length === 0) return apiError("no updates provided", 400);

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("profiles")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return apiError("Failed to update profile: " + error.message, 500);

  return NextResponse.json({ profile: data });
}