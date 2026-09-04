import { NextRequest, NextResponse } from "next/server";
import { apiError, parseBody } from "@/lib/api/helpers";
import { requireSuperAdmin, unauthorized } from "@/lib/api/super-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { randomUUID } from "crypto";

/**
 * GET /api/super/members?tenant_id=... — members of a tenant
 * POST /api/super/members — add a member (user_id + tenant_id + role)
 * PATCH /api/super/members/:id — update member role/active
 * Requires super admin role.
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  if (!tenantId) return apiError("tenant_id required", 400);

  const svc = createServiceClient();
  const { data: members, error } = await svc
    .from("tenant_members")
    .select("*, profiles:user_id(id, email, full_name, role, is_active)")
    .eq("tenant_id", tenantId);

  if (error) return apiError("Failed to fetch members: " + error.message, 500);

  return NextResponse.json({ members: members ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const body = await parseBody<{
    tenant_id: string;
    user_id: string;
    role: string;
  }>(req);
  if (!body?.tenant_id || !body?.user_id || !body?.role) {
    return apiError("tenant_id, user_id, role required", 400);
  }

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("tenant_members")
    .insert({ id: randomUUID(), tenant_id: body.tenant_id, user_id: body.user_id, role: body.role, is_active: true })
    .select()
    .single();

  if (error) return apiError("Failed to add member: " + error.message, 500);

  return NextResponse.json({ member: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const body = await parseBody<{
    id: string;
    role?: string;
    is_active?: boolean;
  }>(req);
  if (!body?.id) return apiError("member id required", 400);

  const updates: Record<string, unknown> = {};
  if (body.role !== undefined) updates.role = body.role;
  if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

  if (Object.keys(updates).length === 0) return apiError("no updates provided", 400);

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("tenant_members")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return apiError("Failed to update member: " + error.message, 500);

  return NextResponse.json({ member: data });
}