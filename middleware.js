import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

/**
 * Middleware for Admin route protection
 */
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_token")?.value;

  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    if (!token) {
      const loginUrl = new URL("/admin", req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/admin", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/**
 * ✅ Correct matcher (IMPORTANT)
 * Covers BOTH admin pages & admin APIs
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
