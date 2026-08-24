import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { setDominoRegistration, type DominoRegistrationChoice } from "@/lib/domino";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export async function POST(request: NextRequest) {
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) return NextResponse.redirect(getRequestUrl(request, "/login"), 303);
  const choice = String((await request.formData()).get("choice"));
  if (choice !== "joined" && choice !== "declined") return NextResponse.redirect(getRequestUrl(request, "/domino?error=choice"), 303);
  try {
    await setDominoRegistration(session.activeUserId, choice as DominoRegistrationChoice);
    return NextResponse.redirect(getRequestUrl(request, "/domino?saved=true"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/domino?error=closed"), 303);
  }
}
