import { createClient } from "./server";
import { cache } from "react";
import type { Tenant } from "@/lib/types";

/**
 * Load the active tenant for a given slug.
 */
export const getTenantBySlug = cache(async (slug: string): Promise<Tenant | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as Tenant;
});

/**
 * Check whether a tenant has a given module enabled.
 * Module enforcement happens here AND at the DB/RLS level.
 */
export function hasModule(tenant: Tenant | null, module: string): boolean {
  if (!tenant) return false;
  return tenant.enabled_modules?.includes(module) ?? false;
}

/**
 * Get enabled modules as a Set for fast lookup.
 */
export function getModuleSet(tenant: Tenant | null): Set<string> {
  return new Set(tenant?.enabled_modules ?? []);
}
