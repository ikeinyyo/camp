import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getRequestUrl,
  isSecureRequest,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(
    getRequestUrl(request, "/admin/login"),
    303,
  );
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/admin",
    maxAge: 0,
  });

  return response;
}
