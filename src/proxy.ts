import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * CHASHNI Proxy (Middleware) — Next.js 16 convention.
 * Runs on the Node.js runtime by default.
 *
 * Responsibilities:
 *  1. Refresh Supabase auth session (cookies)
 *  2. Resolve tenant from subdomain / path / cookie / default
 *  3. Attach tenant + user info to response headers for Server Components
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session for Server Components.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Tenant resolution
  const tenantSlug = resolveTenant(request);

  // Attach tenant + user info to response headers for downstream use
  supabaseResponse.headers.set("x-tenant-slug", tenantSlug);

  if (user) {
    supabaseResponse.headers.set("x-user-id", user.id);
    supabaseResponse.headers.set("x-user-email", user.email || "");
  }

  return supabaseResponse;
}

/**
 * Resolve tenant from request.
 *
 * Strategy (in priority order):
 * 1. Subdomain: {tenant}.chashni.com → "tenant"
 * 2. Path prefix: /t/{tenant}/... → "tenant"
 * 3. Cookie: chashni-tenant → "tenant"
 * 4. Default: NEXT_PUBLIC_DEFAULT_TENANT env var
 */
function resolveTenant(request: NextRequest): string {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;

  // 1. Subdomain
  const baseHost = process.env.NEXT_PUBLIC_BASE_URL
    ?.replace(/^https?:\/\//, "")
    .replace(/:\d+$/, "");
  if (baseHost && host !== baseHost && !host.startsWith("localhost")) {
    const slug = host.replace(`.${baseHost}`, "");
    if (slug && !slug.includes("www") && !slug.includes(".")) {
      return slug;
    }
  }

  // 2. Path prefix /t/{tenant}
  const pathTenant = url.pathname.match(/^\/t\/([a-z0-9-]+)/);
  if (pathTenant) {
    return pathTenant[1];
  }

  // 3. Cookie
  const cookieTenant = request.cookies.get("chashni-tenant")?.value;
  if (cookieTenant) {
    return cookieTenant;
  }

  // 4. Default
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT || "chashni";
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, etc.)
     * - demo routes (static demo pages, no auth needed)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|demo).*)",
  ],
};
