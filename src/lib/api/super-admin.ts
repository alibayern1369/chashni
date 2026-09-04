import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Verify the current user is a super admin (role = 'super_admin' in profiles).
 * Returns the user or null if not authorized.
 */
export async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "super_admin") return null;
  return { user, supabase };
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
