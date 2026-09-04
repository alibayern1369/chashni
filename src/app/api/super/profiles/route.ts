import { NextRequest, NextResponse } from "next/server";
import { apiError, parseBody } from "@/lib/api/helpers";
import { requireSuperAdmin, unauthorized } from "@/lib/api/super-admin";
import { createServiceClient } from "@/lib/supabase/service";
import {
  isValidUsername,
  normalizeUsername,
  toAuthEmail,
} from "@/lib/auth/identity";

/**
 * GET /api/super/profiles — list profiles
 * POST /api/super/profiles — create user (username + password + role)
 * PATCH /api/super/profiles — update role / is_active / password / username
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

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const body = await parseBody<{
    username: string;
    password: string;
    role?: string;
    full_name?: string;
    tenant_id?: string;
    tenant_role?: string;
  }>(req);

  if (!body?.username || !body?.password) {
    return apiError("username and password required", 400);
  }
  if (!isValidUsername(body.username)) {
    return apiError("Invalid username (3–32 chars: a-z, 0-9, . _ -)", 400);
  }
  if (body.password.length < 4) {
    return apiError("Password must be at least 4 characters", 400);
  }

  const username = normalizeUsername(body.username);
  const email = toAuthEmail(username);
  const role = body.role || "customer";
  const allowed = ["super_admin", "restaurant_admin", "kitchen_staff", "customer"];
  if (!allowed.includes(role)) return apiError("Invalid role", 400);

  const svc = createServiceClient();

  const { data: created, error: createError } = await svc.auth.admin.createUser({
    email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      username,
      full_name: body.full_name || username,
      role,
    },
  });

  if (createError || !created.user) {
    return apiError(createError?.message || "Failed to create user", 500);
  }

  const { data: profile, error: profileError } = await svc
    .from("profiles")
    .upsert({
      id: created.user.id,
      email,
      username,
      full_name: body.full_name || username,
      role,
      is_active: true,
    })
    .select()
    .single();

  if (profileError) {
    return apiError("User created but profile failed: " + profileError.message, 500);
  }

  if (body.tenant_id) {
    await svc.from("tenant_members").upsert(
      {
        tenant_id: body.tenant_id,
        user_id: created.user.id,
        role: body.tenant_role || "admin",
        is_active: true,
      },
      { onConflict: "tenant_id,user_id" },
    );
  }

  return NextResponse.json({ profile }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth) return unauthorized();

  const body = await parseBody<{
    id: string;
    role?: string;
    is_active?: boolean;
    password?: string;
    username?: string;
    full_name?: string;
  }>(req);
  if (!body?.id) return apiError("profile id required", 400);

  const svc = createServiceClient();
  const updates: Record<string, unknown> = {};

  if (body.role !== undefined) updates.role = body.role;
  if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
  if (body.full_name !== undefined) updates.full_name = body.full_name;

  if (body.username !== undefined) {
    if (!isValidUsername(body.username)) {
      return apiError("Invalid username", 400);
    }
    const username = normalizeUsername(body.username);
    updates.username = username;
    updates.email = toAuthEmail(username);
    const { error: authErr } = await svc.auth.admin.updateUserById(body.id, {
      email: toAuthEmail(username),
      user_metadata: { username },
    });
    if (authErr) return apiError(authErr.message, 500);
  }

  if (body.password) {
    if (body.password.length < 4) {
      return apiError("Password must be at least 4 characters", 400);
    }
    const { error: passErr } = await svc.auth.admin.updateUserById(body.id, {
      password: body.password,
    });
    if (passErr) return apiError(passErr.message, 500);
  }

  if (Object.keys(updates).length === 0 && !body.password) {
    return apiError("no updates provided", 400);
  }

  let data = null;
  if (Object.keys(updates).length > 0) {
    const res = await svc
      .from("profiles")
      .update(updates)
      .eq("id", body.id)
      .select()
      .single();
    if (res.error) return apiError("Failed to update profile: " + res.error.message, 500);
    data = res.data;
  } else {
    const res = await svc.from("profiles").select("*").eq("id", body.id).single();
    data = res.data;
  }

  return NextResponse.json({ profile: data, passwordUpdated: !!body.password });
}
