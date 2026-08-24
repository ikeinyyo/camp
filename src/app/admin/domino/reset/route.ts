import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { resetDominoTournament } from "@/lib/domino";

export async function POST(request: NextRequest) {
  try {
    await resetDominoTournament();
    return NextResponse.redirect(getRequestUrl(request, "/admin/domino?saved=reset"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/domino?error=reset"), 303);
  }
}
