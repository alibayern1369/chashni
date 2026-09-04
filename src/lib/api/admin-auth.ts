import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "./helpers";
import type { Tenant, TenantMemberRole } from "@/lib/types";

export type AdminAccess = {
  userId: string;
  role: TenantMemberRole | "super_admin";
  isSuperAdmin: boolean;
};

const ADMIN_WRITE_ROLES: TenantMemberRole[] = ["owner", "admin", "staff"];
const KITCHEN_ROLES: TenantMemberRole[] = ["owner", "admin", "staff", "kitchen"];

/**
 * Require an authenticated tenant member (or super_admin).
 * @param scope "read" | "write" | "kitchen" — write excludes pure kitchen role for menu/settings.
 */
export async function requireTenantAccess(
  tenant: Tenant | null,
  scope: "read" | "write" | "kitchen" = "read",
): Promise<{ access: AdminAccess } | { error: NextResponse }> {
  if (!tenant) return { error: apiError("Tenant not found", 404) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: apiError("Authentication required", 401) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "super_admin") {
    return {
      access: { userId: user.id, role: "super_admin", isSuperAdmin: true },
    };
  }

  const { data: member } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!member) {
    return { error: apiError("Not a member of this restaurant", 403) };
  }

  const role = member.role as TenantMemberRole;

  if (scope === "write" && !ADMIN_WRITE_ROLES.includes(role)) {
    return { error: apiError("Insufficient permissions", 403) };
  }

  if (scope === "kitchen" && !KITCHEN_ROLES.includes(role)) {
    return { error: apiError("Insufficient permissions", 403) };
  }

  return {
    access: { userId: user.id, role, isSuperAdmin: false },
  };
}

/** Client-facing check used by admin layout */
export async function checkAdminAccessApi(): Promise<Response> {
  const supabase = await createClient();
  const headers = await import("next/headers");
  const headerStore = await headers.headers();
  const slug =
    headerStore.get("x-tenant-slug") ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    "chashni";

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  const result = await requireTenantAccess(tenant as Tenant | null, "read");
  if ("error" in result) return result.error;
  return NextResponse.json({
    ok: true,
    role: result.access.role,
    isSuperAdmin: result.access.isSuperAdmin,
  });
}
