import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Tenant } from "@/lib/types";

/**
 * Resolve the tenant from the request's proxy headers.
 */
export async function getTenantFromRequest(): Promise<{
  tenant: Tenant | null;
  supabase: Awaited<ReturnType<typeof createClient>>;
}> {
  const supabase = await createClient();
  const headers = await import("next/headers");
  const headerStore = await headers.headers();
  const slug = headerStore.get("x-tenant-slug") || process.env.NEXT_PUBLIC_DEFAULT_TENANT || "chashni";

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  return { tenant: (tenant as Tenant) ?? null, supabase };
}

/**
 * Standard error response for API routes.
 */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Parse JSON body safely.
 */
export async function parseBody<T>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
