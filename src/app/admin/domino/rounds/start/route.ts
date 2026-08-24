import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { startNextDominoRound } from "@/lib/domino";

export async function POST(request: NextRequest) {
  try {
    const round = await startNextDominoRound();
    return NextResponse.redirect(getRequestUrl(request, `/admin/domino?saved=round&round=${round}`), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar la ronda.";
    return NextResponse.redirect(getRequestUrl(request, `/admin/domino?error=round&message=${encodeURIComponent(message)}`), 303);
  }
}
