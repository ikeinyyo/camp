import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl, isSecureRequest } from "@/lib/admin-auth";
import {
  createUser,
  UsernameAlreadyExistsError,
  UserValidationError,
} from "@/lib/users";
import {
  USER_COOKIE_NAME,
  USER_SESSION_MAX_AGE,
  addUserToSession,
  createUserSessionToken,
  readUserSessionToken,
} from "@/lib/user-session";
import { isSectionEnabled } from "@/lib/sections";

export async function POST(request: NextRequest) {
  if (!(await isSectionEnabled("access"))) {
    return NextResponse.redirect(getRequestUrl(request, "/"), 303);
  }
  const formData = await request.formData();
  const username = formData.get("username");
  const displayName = formData.get("displayName");
  const password = formData.get("password");
  if (
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.redirect(getRequestUrl(request, "/registro?error=missing"), 303);
  }

  try {
    const user = await createUser({
      username,
      displayName: typeof displayName === "string" ? displayName : undefined,
      password,
    });
    const response = NextResponse.redirect(getRequestUrl(request, "/?registered=true"), 303);
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
  } catch (error) {
    const code =
      error instanceof UsernameAlreadyExistsError
        ? "duplicate"
        : error instanceof UserValidationError
          ? error.code
          : "config";
    return NextResponse.redirect(getRequestUrl(request, `/registro?error=${code}`), 303);
  }
}
