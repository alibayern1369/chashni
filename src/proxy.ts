import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT || "chashni";

/**
 * Public surfaces:
 *   /site/*     platform landing
 *   /demo/*     portfolio demo
 *   /super/*    super-admin (physical)
 *   /r/{slug}/* restaurant → rewrite to /fa/*
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/site", request.url));
  }

  if (pathname === "/fa/admin/super" || pathname.startsWith("/fa/admin/super/")) {
    const rest = pathname.slice("/fa/admin/super".length);
    return NextResponse.redirect(new URL(`/super${rest}${search}`, request.url));
  }

  if (pathname.startsWith("/en/admin/super")) {
    const rest = pathname.slice("/en/admin/super".length);
    return NextResponse.redirect(new URL(`/super${rest}${search}`, request.url));
  }

  // Old restaurant locale paths → /r/{tenant}/...
  if (pathname === "/fa" || (pathname.startsWith("/fa/") && !pathname.startsWith("/fa/admin/super"))) {
    const rest = pathname === "/fa" ? "" : pathname.slice(3);
    return NextResponse.redirect(
      new URL(`/r/${DEFAULT_TENANT}${rest}${search}`, request.url),
    );
  }

  const rMatch = pathname.match(/^\/r\/([a-z0-9-]+)(\/.*)?$/);
  if (rMatch) {
    const slug = rMatch[1];
    const rest = rMatch[2] || "";

    if (rest.startsWith("/admin/super")) {
      return NextResponse.redirect(
        new URL(`/super${rest.slice("/admin/super".length)}${search}`, request.url),
      );
    }

    const destPath = rest ? `/fa${rest}` : "/fa";
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = destPath;

    // Attach tenant on the request via cookie + header after auth refresh
    return refreshSessionAndRewrite(request, rewriteUrl, slug);
  }

  const tenantSlug = resolveTenant(request);
  return refreshSessionAndNext(request, tenantSlug);
}

async function refreshSessionAndRewrite(
  request: NextRequest,
  rewriteUrl: URL,
  tenantSlug: string,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.rewrite(rewriteUrl);
  response.headers.set("x-tenant-slug", tenantSlug);
  response.cookies.set("chashni-tenant", tenantSlug, { path: "/", sameSite: "lax" });

  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.rewrite(rewriteUrl);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        response.headers.set("x-tenant-slug", tenantSlug);
        response.cookies.set("chashni-tenant", tenantSlug, { path: "/", sameSite: "lax" });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    response.headers.set("x-user-id", user.id);
    response.headers.set("x-user-email", user.email || "");
  }
  response.headers.set("x-tenant-slug", tenantSlug);
  return response;
}

async function refreshSessionAndNext(request: NextRequest, tenantSlug: string) {
  let response = NextResponse.next({ request });
  response.headers.set("x-tenant-slug", tenantSlug);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        response.headers.set("x-tenant-slug", tenantSlug);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    response.headers.set("x-user-id", user.id);
    response.headers.set("x-user-email", user.email || "");
  }
  return response;
}

function resolveTenant(request: NextRequest): string {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;

  const rMatch = url.pathname.match(/^\/r\/([a-z0-9-]+)/);
  if (rMatch) return rMatch[1];

  const baseHost = process.env.NEXT_PUBLIC_BASE_URL
    ?.replace(/^https?:\/\//, "")
    .replace(/:\d+$/, "");
  if (baseHost && host !== baseHost && !host.startsWith("localhost")) {
    const slug = host.replace(`.${baseHost}`, "");
    if (slug && !slug.includes("www") && !slug.includes(".")) return slug;
  }

  const pathTenant = url.pathname.match(/^\/t\/([a-z0-9-]+)/);
  if (pathTenant) return pathTenant[1];

  return request.cookies.get("chashni-tenant")?.value || DEFAULT_TENANT;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|demo).*)",
  ],
};
