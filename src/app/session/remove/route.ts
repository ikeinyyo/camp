import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl, isSecureRequest } from "@/lib/admin-auth";
import {
  USER_COOKIE_NAME,
  USER_SESSION_MAX_AGE,
  createUserSessionToken,
  readUserSessionToken,
  removeUserFromSession,
} from "@/lib/user-session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const userId = formData.get("userId");
  const session = readUserSessionToken(
    request.cookies.get(USER_COOKIE_NAME)?.value,
  );

  if (typeof userId !== "string" || !session?.userIds.includes(userId)) {
    return NextResponse.redirect(getRequestUrl(request, "/"), 303);
  }

  const nextSession = removeUserFromSession(session, userId);
  const response = NextResponse.redirect(getRequestUrl(request, "/"), 303);

  if (nextSession) {
    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: createUserSessionToken(nextSession),
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest(request),
      path: "/",
      maxAge: USER_SESSION_MAX_AGE,
    });
  } else {
    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest(request),
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}
