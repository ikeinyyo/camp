import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { awardContestPoints } from "@/lib/contest-awards";

export async function POST(request: NextRequest) {
  try {
    await awardContestPoints("tapas");
    return NextResponse.redirect(getRequestUrl(request, "/admin/tapas?saved=awards"), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron asignar los puntos.";
    return NextResponse.redirect(getRequestUrl(request, `/admin/tapas?error=awards&message=${encodeURIComponent(message)}`), 303);
  }
}
