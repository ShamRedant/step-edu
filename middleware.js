import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

/**
 * 🔐 Validate Basic Auth
 */
function isValidBasicAuth(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  const base64 = authHeader.split(" ")[1];
  const decoded = Buffer.from(base64, "base64").toString("utf-8");
  const [username, password] = decoded.split(":");

  return (
    username === process.env.BASIC_AUTH_USER &&
    password === process.env.BASIC_AUTH_PASS
  );
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ✅ Skip Next.js internals & static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // ===============================
  // 🔐 STEP 1: BASIC AUTH (ENTIRE SITE)
  // ===============================
  if (!isValidBasicAuth(req)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  // ===============================
  // 🔒 STEP 2: ADMIN JWT PROTECTION
  // ===============================
  if (pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_token")?.value;

  // 🔒 Admin APIs
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

  // 🔒 Admin Pages
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

/**
 * 🌍 Apply to ENTIRE SITE
 */
export const config = {
  matcher: ["/:path*"],
};
