import { NextResponse } from "next/server";

/**
 * The API lives on Railway while this app runs on Vercel. Railway's host-only
 * httpOnly cookies are sent to the API by the browser, but are not visible to
 * this separate frontend domain, so route authorization remains with Django.
 */
export function proxy() {
  return NextResponse.next();
}
