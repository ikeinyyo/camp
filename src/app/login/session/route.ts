import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl, isSecureRequest } from "@/lib/admin-auth";
import { authenticateUser } from "@/lib/users";
import { isSectionEnabled } from "@/lib/sections";
import {
  USER_COOKIE_NAME,
  USER_SESSION_MAX_AGE,
  addUserToSession,
  createUserSessionToken,
  readUserSessionToken,
} from "@/lib/user-session";

export async function POST(request: NextRequest) {
  if (!(await isSectionEnabled("access"))) {
    return NextResponse.redirect(getRequestUrl(request, "/"), 303);
  }
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.redirect(getRequestUrl(request, "/login?error=invalid"), 303);
  }

  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.redirect(getRequestUrl(request, "/login?error=invalid"), 303);
    }

    const response = NextResponse.redirect(getRequestUrl(request, "/"), 303);
    const session = addUserToSession(
      readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value),
      user.id,
    );
    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: createUserSessionToken(session),
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureRequest(request),
      path: "/",
      maxAge: USER_SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/login?error=config"), 303);
  }
}
