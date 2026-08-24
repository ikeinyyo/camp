import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { setDominoRegistration, type DominoRegistrationChoice } from "@/lib/domino";

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const choice = String((await request.formData()).get("choice"));
  if (choice !== "joined" && choice !== "declined") return NextResponse.redirect(getRequestUrl(request, "/admin/domino?error=registration"), 303);
  try {
    await setDominoRegistration((await params).userId, choice as DominoRegistrationChoice);
    return NextResponse.redirect(getRequestUrl(request, "/admin/domino?saved=registration"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/domino?error=registration"), 303);
  }
}
