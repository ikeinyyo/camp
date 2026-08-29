import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl, isSecureRequest } from "@/lib/admin-auth";
import {
  USER_COOKIE_NAME,
  USER_SESSION_MAX_AGE,
  createUserSessionToken,
  getSafeSessionReturnPath,
  readUserSessionToken,
} from "@/lib/user-session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const userId = formData.get("userId");
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (typeof userId !== "string" || !session?.userIds.includes(userId)) {
    return NextResponse.redirect(getRequestUrl(request, "/login"), 303);
  }

  const returnTo = getSafeSessionReturnPath(formData.get("returnTo"));
  const response = NextResponse.redirect(getRequestUrl(request, returnTo), 303);
  response.cookies.set({
    name: USER_COOKIE_NAME,
    value: createUserSessionToken({ ...session, activeUserId: userId }),
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: USER_SESSION_MAX_AGE,
  });
  return response;
}
