import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth/session";

const ADMIN_ROOT = "/admin";
const ADMIN_LOGIN = "/admin/login";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith(ADMIN_ROOT) && pathname !== ADMIN_LOGIN) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, req.url));
    }

    const payload = await verifyToken(token);

    if (!payload || payload.role !== "admin") {
      const response = NextResponse.redirect(new URL(ADMIN_LOGIN, req.url));
      response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
