import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { setDominoMatchWinner } from "@/lib/domino";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const winnerTeamId = String((await request.formData()).get("winnerTeamId") ?? "");
  try {
    await setDominoMatchWinner((await params).id, winnerTeamId);
    return NextResponse.redirect(getRequestUrl(request, "/admin/domino?saved=result"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/domino?error=result"), 303);
  }
}
