import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE_NAME } from "@/constants/auth";

/**
 * Guard the dashboard. This is a presence check on the httpOnly access cookie —
 * the API does the real signature validation on every request. If the access
 * cookie has expired but a refresh cookie survives, the client transparently
 * refreshes (see lib/api/client.ts), so we also let requests through when a
 * refresh cookie is present.
 */
export function proxy(request: NextRequest) {
  const hasAccess = request.cookies.has(ACCESS_COOKIE_NAME);
  const hasRefresh = request.cookies.has("kag_refresh");

  if (!hasAccess && !hasRefresh) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
