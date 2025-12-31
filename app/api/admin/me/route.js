import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req) {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      authenticated: true,
      admin: payload,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
