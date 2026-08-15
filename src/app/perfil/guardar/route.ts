import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { updateUserProfile } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export async function POST(request: NextRequest) {
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) return NextResponse.redirect(getRequestUrl(request, "/login"), 303);
  try {
    const data = await request.formData();
    const avatar = data.get("image");
    await updateUserProfile(session.activeUserId, {
      displayName: String(data.get("displayName") ?? ""),
      status: String(data.get("status") ?? ""),
      ...(avatar instanceof File && avatar.size ? { avatar } : {}),
    });
    return NextResponse.redirect(getRequestUrl(request, "/perfil?saved=true"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/perfil?error=profile"), 303);
  }
}
