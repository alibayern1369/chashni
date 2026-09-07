/**
 * Canonical public URL helpers — keep surfaces separated.
 *
 * /site/*     platform landing
 * /demo/*     portfolio demo
 * /super/*    platform super-admin
 * /r/{slug}/* restaurant (customer + admin)
 */

import type { Locale } from "@/lib/types";

export const DEFAULT_TENANT_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_TENANT || "chashni";

export function restaurantBase(slug: string = DEFAULT_TENANT_SLUG): string {
  return `/r/${slug}`;
}

/** e.g. restaurantPath("/menu", "chashni") → /r/chashni/menu */
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

/**
 * Strip tenant + locale prefixes so we can rebuild locale URLs safely.
 * /r/chashni/menu → /menu
 * /en/menu → /menu
 * /fa/build-burger → /build-burger
 * /menu → /menu
 */
export function restaurantRestPath(pathname: string): string {
  let path = pathname.split("?")[0] || "/";
  const rMatch = path.match(/^\/r\/[^/]+(\/.*)?$/);
  if (rMatch) path = rMatch[1] || "/";
  path = path.replace(/^\/(fa|en)(?=\/|$)/, "") || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  return path === "" ? "/" : path;
}

/** FA uses /r/{slug}/..., EN uses legacy /en/... (tenant via cookie). */
export function pathForLocale(
  pathnameOrRest: string,
  target: Locale,
  slug: string = DEFAULT_TENANT_SLUG,
): string {
  const rest = restaurantRestPath(pathnameOrRest);
  if (target === "fa") {
    return restaurantPath(rest === "/" ? "" : rest, slug);
  }
  return rest === "/" ? "/en" : `/en${rest}`;
}
