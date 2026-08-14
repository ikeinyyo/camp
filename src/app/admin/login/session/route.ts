import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  getRequestUrl,
  isSecureRequest,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const formData = await request.formData();
  const password = formData.get("password");

  if (!adminPassword) {
    return NextResponse.redirect(
      getRequestUrl(request, "/admin/login?error=config"),
      303,
    );
  }

  if (
    typeof password !== "string" ||
    !(await isValidAdminPassword(password, adminPassword))
  ) {
    return NextResponse.redirect(
      getRequestUrl(request, "/admin/login?error=invalid"),
      303,
    );
  }

  const response = NextResponse.redirect(getRequestUrl(request, "/admin"), 303);
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: await createAdminSessionToken(adminPassword),
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return response;
}
