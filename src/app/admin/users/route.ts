import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import {
  createUser,
  UsernameAlreadyExistsError,
  UserValidationError,
} from "@/lib/users";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = formData.get("username");
  const displayName = formData.get("displayName");
  const password = formData.get("password");

  if (
    typeof username !== "string" ||
    typeof displayName !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.redirect(
      getRequestUrl(request, "/admin/users/new?error=validation"),
      303,
    );
  }

  try {
    await createUser({ username, displayName, password });
    return NextResponse.redirect(
      getRequestUrl(request, "/admin?saved=created"),
      303,
    );
  } catch (error) {
    const code =
      error instanceof UsernameAlreadyExistsError
        ? "duplicate"
        : error instanceof UserValidationError
          ? "validation"
          : "storage";
    return NextResponse.redirect(
      getRequestUrl(request, `/admin/users/new?error=${code}`),
      303,
    );
  }
}
