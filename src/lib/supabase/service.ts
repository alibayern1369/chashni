import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireSupabasePublicEnv } from "./env";

/**
 * Service-role client — bypasses RLS.
 *
 * ONLY use in server-side code behind a strict super-admin authorization
 * check. NEVER expose this key to the client (no NEXT_PUBLIC_ prefix).
 */
export function createServiceClient() {
  const { url } = requireSupabasePublicEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in Vercel → Settings → Environment Variables.",
    );
  }
  return createSupabaseClient(url, serviceKey);
}
