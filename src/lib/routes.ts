/**
 * Canonical public URL helpers — keep surfaces separated.
 *
 * /site/*     platform landing
 * /demo/*     portfolio demo
 * /super/*    platform super-admin
 * /r/{slug}/* restaurant (customer + admin)
 */

export const DEFAULT_TENANT_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_TENANT || "chashni";

export function restaurantBase(slug: string = DEFAULT_TENANT_SLUG): string {
  return `/r/${slug}`;
}

/** e.g. restaurantPath("chashni", "/menu") → /r/chashni/menu */
export function restaurantPath(
  path: string = "",
  slug: string = DEFAULT_TENANT_SLUG,
): string {
  const base = restaurantBase(slug);
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function superPath(path: string = ""): string {
  if (!path || path === "/") return "/super";
  return `/super${path.startsWith("/") ? path : `/${path}`}`;
}

export function sitePath(path: string = ""): string {
  if (!path || path === "/") return "/site";
  return `/site${path.startsWith("/") ? path : `/${path}`}`;
}

/** Parse /r/{slug}/... from a pathname */
export function tenantSlugFromPathname(pathname: string): string | null {
  const m = pathname.match(/^\/r\/([a-z0-9-]+)(?:\/|$)/);
  return m?.[1] ?? null;
}
