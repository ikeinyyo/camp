import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { awardContestPoints } from "@/lib/contest-awards";

export async function POST(request: NextRequest) {
  try {
    await awardContestPoints("talents");
    return NextResponse.redirect(getRequestUrl(request, "/admin/talentos?saved=awards"), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron asignar los puntos.";
    return NextResponse.redirect(getRequestUrl(request, `/admin/talentos?error=awards&message=${encodeURIComponent(message)}`), 303);
  }
}
