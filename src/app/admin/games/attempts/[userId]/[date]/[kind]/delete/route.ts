import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { deleteDailyGameAttempt } from "@/lib/daily-games";
import type { DailyGameKind } from "@/config/daily-games";

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string; date: string; kind: string }> }) {
  const { userId, date, kind } = await params;
  try {
    if (!["trivia", "word", "poll"].includes(kind)) throw new Error();
    await deleteDailyGameAttempt(userId, date, kind as DailyGameKind);
    return NextResponse.redirect(getRequestUrl(request, "/admin/games?saved=attempt-deleted"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/games?error=attempt-delete"), 303);
  }
}
