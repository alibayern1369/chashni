/** Local synthetic email domain for username-based Supabase Auth. */
export const AUTH_LOCAL_DOMAIN = "chashni.local";

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(raw: string): boolean {
  return USERNAME_RE.test(normalizeUsername(raw));
}

/**
 * Map login identifier to the email Supabase Auth expects.
 * - `admin` → `admin@chashni.local`
 * - `you@example.com` → unchanged (legacy email accounts)
 */
export function toAuthEmail(login: string): string {
  const trimmed = login.trim().toLowerCase();
  if (!trimmed) return trimmed;
  if (trimmed.includes("@")) return trimmed;
  return `${normalizeUsername(trimmed)}@${AUTH_LOCAL_DOMAIN}`;
}

/** Display username from auth email when using local domain. */
export function displayLogin(email: string | null | undefined, username?: string | null): string {
  if (username) return username;
  if (!email) return "";
  if (email.endsWith(`@${AUTH_LOCAL_DOMAIN}`)) {
    return email.slice(0, -(AUTH_LOCAL_DOMAIN.length + 1));
  }
  return email;
}
