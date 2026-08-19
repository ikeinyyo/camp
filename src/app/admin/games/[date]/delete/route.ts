import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { deleteConfiguredDailyGames } from "@/lib/daily-games";

export async function POST(request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  try {
    await deleteConfiguredDailyGames((await params).date);
    return NextResponse.redirect(getRequestUrl(request, "/admin/games?saved=deleted"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/games?error=delete"), 303);
  }
}
