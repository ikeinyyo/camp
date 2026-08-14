import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getRequestUrl,
  isValidAdminSession,
} from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isLoginSubmission = pathname === "/admin/login/session";
  const hasValidSession = await isValidAdminSession(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value,
    process.env.ADMIN_PASSWORD,
  );

  if (isLoginPage) {
    return hasValidSession
      ? NextResponse.redirect(getRequestUrl(request, "/admin"))
      : NextResponse.next();
  }

  if (isLoginSubmission) {
    return NextResponse.next();
  }

  if (!hasValidSession) {
    return NextResponse.redirect(getRequestUrl(request, "/admin/login"));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
