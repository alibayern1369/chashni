import { headers } from "next/headers";
import { cache } from "react";
import { createClient } from "./server";

/**
 * Get the current authenticated user in a Server Component.
 * Reads the user info set by the proxy (middleware) headers.
 */
export const getUser = cache(async () => {
  const headerStore = await headers();
  const userId = headerStore.get("x-user-id");

  if (!userId) {
    return null;
  }

  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user?.user) {
    return null;
  }
  return user.user;
});

/**
 * Get the current tenant slug from proxy headers.
 */
export const getTenantSlug = cache(async () => {
  const headerStore = await headers();
  return headerStore.get("x-tenant-slug") || process.env.NEXT_PUBLIC_DEFAULT_TENANT || "chashni";
});
