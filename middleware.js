import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

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
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || ""
      );
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || ""
      );
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
