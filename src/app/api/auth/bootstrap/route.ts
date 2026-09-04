import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { apiError } from "@/lib/api/helpers";
import { toAuthEmail } from "@/lib/auth/identity";

const BOOTSTRAP_USER = "admin";
const BOOTSTRAP_PASS = "admin";

/**
 * GET /api/auth/bootstrap — whether initial super admin is needed.
 * POST /api/auth/bootstrap — create admin/admin if no super_admin exists.
 */
export async function GET() {
  try {
    const svc = createServiceClient();
    const { count, error } = await svc
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("is_active", true);

    if (error) return apiError(error.message, 500);
    return NextResponse.json({ needsBootstrap: (count ?? 0) === 0 });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Bootstrap check failed", 500);
  }
}

export async function POST() {
  try {
    const svc = createServiceClient();
    const { count, error: countError } = await svc
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("is_active", true);

    if (countError) return apiError(countError.message, 500);
    if ((count ?? 0) > 0) {
      return apiError("Super admin already exists", 409);
    }

    const email = toAuthEmail(BOOTSTRAP_USER);
    const { data: created, error: createError } = await svc.auth.admin.createUser({
      email,
      password: BOOTSTRAP_PASS,
      email_confirm: true,
      user_metadata: {
        username: BOOTSTRAP_USER,
        full_name: "Super Admin",
        role: "super_admin",
      },
    });

    if (createError || !created.user) {
      return apiError(createError?.message || "Failed to create admin user", 500);
    }

    await svc.from("profiles").upsert({
      id: created.user.id,
      email,
      username: BOOTSTRAP_USER,
      full_name: "Super Admin",
      role: "super_admin",
      is_active: true,
    });

    const { data: tenant } = await svc
      .from("tenants")
      .select("id")
      .eq("slug", process.env.NEXT_PUBLIC_DEFAULT_TENANT || "chashni")
      .maybeSingle();

    if (tenant) {
      await svc.from("tenant_members").upsert(
        {
          tenant_id: tenant.id,
          user_id: created.user.id,
          role: "owner",
          is_active: true,
        },
        { onConflict: "tenant_id,user_id" },
      );
    }

    return NextResponse.json({
      ok: true,
      username: BOOTSTRAP_USER,
      password: BOOTSTRAP_PASS,
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Bootstrap failed", 500);
  }
}
