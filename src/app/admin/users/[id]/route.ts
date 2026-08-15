import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import {
  updateUser,
  UsernameAlreadyExistsError,
  UserValidationError,
} from "@/lib/users";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const formData = await request.formData();
  const username = formData.get("username");
  const displayName = formData.get("displayName");
  const points = Number(formData.get("points"));
  const password = formData.get("password");
  const approved = formData.get("approved") === "true";

  if (
    typeof username !== "string" ||
    typeof displayName !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.redirect(getRequestUrl(request, "/admin?error=validation"), 303);
  }

  try {
    await updateUser(id, {
      username,
      displayName,
      points,
      approved,
      ...(password ? { password } : {}),
    });
    return NextResponse.redirect(getRequestUrl(request, "/admin?saved=true"), 303);
  } catch (error) {
    const code =
      error instanceof UsernameAlreadyExistsError
        ? "duplicate"
        : error instanceof UserValidationError
          ? "validation"
          : "storage";
    return NextResponse.redirect(getRequestUrl(request, `/admin?error=${code}`), 303);
  }
}
