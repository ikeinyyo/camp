import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl, isSecureRequest } from "@/lib/admin-auth";
import { USER_COOKIE_NAME } from "@/lib/user-session";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(getRequestUrl(request, "/"), 303);
  response.cookies.set({
    name: USER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 0,
  });
  return response;
}
