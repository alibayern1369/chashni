import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS.
 *
 * ONLY use in server-side code behind a strict super-admin authorization
 * check. NEVER expose this key to the client (no NEXT_PUBLIC_ prefix).
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
