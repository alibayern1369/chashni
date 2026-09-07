import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError, parseBody } from "@/lib/api/helpers";
import { createServiceClient } from "@/lib/supabase/service";
import { randomUUID } from "crypto";
import type { TenantMemberRole } from "@/lib/types";

const ROLES: TenantMemberRole[] = ["owner", "admin", "staff", "kitchen"];

/**
 * GET /api/admin/members — list restaurant staff
 * POST /api/admin/members — add member by email/username
 * PATCH /api/admin/members — update role / active / kitchen_can_advance
 */
export async function GET() {
  const auth = await requireAdminApi("manage");
  if ("error" in auth) return auth.error;
  const { tenant } = auth;

  let svc;
  try {
    svc = createServiceClient();
  } catch {
    return apiError("Service role required for staff management", 500);
  }

  const { data: members, error } = await svc
    .from("tenant_members")
    .select("*, profiles:user_id(id, email, username, full_name, is_active)")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: true });

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ members: members ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi("manage");
  if ("error" in auth) return auth.error;
  const { tenant, access } = auth;

  const body = await parseBody<{
    login: string;
    role: TenantMemberRole;
    kitchen_can_advance?: boolean;
  }>(req);

  if (!body?.login?.trim() || !body?.role) {
    return apiError("login and role required", 400);
  }
  if (!ROLES.includes(body.role)) return apiError("invalid role", 400);

  // Only owner can assign owner
  if (body.role === "owner" && access.role !== "owner" && !access.isSuperAdmin) {
    return apiError("Only owner can assign owner role", 403);
  }

  let svc;
  try {
    svc = createServiceClient();
  } catch {
    return apiError("Service role required for staff management", 500);
  }

  const login = body.login.trim().toLowerCase();
  let profile: { id: string; email: string | null; username: string | null } | null = null;

  const { data: byEmail } = await svc
    .from("profiles")
    .select("id, email, username")
    .eq("email", login)
    .maybeSingle();
  profile = byEmail;

  if (!profile) {
    const { data: byUser } = await svc
      .from("profiles")
      .select("id, email, username")
      .eq("username", login)
      .maybeSingle();
    profile = byUser;
  }

  if (!profile && !login.includes("@")) {
    const { data: byLocal } = await svc
      .from("profiles")
      .select("id, email, username")
      .eq("email", `${login}@chashni.local`)
      .maybeSingle();
    profile = byLocal;
  }

  if (!profile) {
    return apiError("User not found — they must sign up first", 404);
  }

  const { data: existing } = await svc
    .from("tenant_members")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existing) return apiError("User is already a member", 400);

  const { data, error } = await svc
    .from("tenant_members")
    .insert({
      id: randomUUID(),
      tenant_id: tenant.id,
      user_id: profile.id,
      role: body.role,
      is_active: true,
      kitchen_can_advance: body.role === "kitchen" ? body.kitchen_can_advance !== false : true,
    })
    .select("*, profiles:user_id(id, email, username, full_name, is_active)")
    .single();

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ member: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminApi("manage");
  if ("error" in auth) return auth.error;
  const { tenant, access } = auth;

  const body = await parseBody<{
    id: string;
    role?: TenantMemberRole;
    is_active?: boolean;
    kitchen_can_advance?: boolean;
  }>(req);

  if (!body?.id) return apiError("id required", 400);

  const updates: Record<string, unknown> = {};
  if (body.role !== undefined) {
    if (!ROLES.includes(body.role)) return apiError("invalid role", 400);
    if (body.role === "owner" && access.role !== "owner" && !access.isSuperAdmin) {
      return apiError("Only owner can assign owner role", 403);
    }
    updates.role = body.role;
  }
  if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
  if (typeof body.kitchen_can_advance === "boolean") {
    updates.kitchen_can_advance = body.kitchen_can_advance;
  }

  if (Object.keys(updates).length === 0) return apiError("no updates", 400);

  let svc;
  try {
    svc = createServiceClient();
  } catch {
    return apiError("Service role required for staff management", 500);
  }

  const { data, error } = await svc
    .from("tenant_members")
    .update(updates)
    .eq("id", body.id)
    .eq("tenant_id", tenant.id)
    .select("*, profiles:user_id(id, email, username, full_name, is_active)")
    .single();

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ member: data });
}
