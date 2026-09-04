import { createClient } from "./server";
import { cache } from "react";

/**
 * Fetch the tenant context for a given slug.
 * Uses React.cache so it's only fetched once per request.
 */
export const getTenantBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }
  return data;
});

/**
 * Fetch tenant context with settings for a given slug.
 */
export const getTenantContext = cache(async (slug: string) => {
  const supabase = await createClient();
  const [tenant, settings] = await Promise.all([
    supabase.from("tenants").select("*").eq("slug", slug).eq("is_active", true).single(),
    supabase
      .from("tenant_settings")
      .select("*")
      .in("key", ["design", "hours", "social", "modules"]),
  ]);

  if (tenant.error || !tenant.data) {
    return null;
  }

  const settingsMap: Record<string, Record<string, unknown>> = {};
  settings.data?.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return {
    tenant: tenant.data,
    settings: settingsMap,
  };
});
