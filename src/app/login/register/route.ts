import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import {
  createUser,
  UsernameAlreadyExistsError,
  UserValidationError,
} from "@/lib/users";
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
    await createUser({
      username,
      displayName: typeof displayName === "string" ? displayName : undefined,
      password,
    });
    return NextResponse.redirect(getRequestUrl(request, "/login?registered=pending"), 303);
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
