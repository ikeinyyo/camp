import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { dailyGamesFromForm } from "@/lib/daily-games-form";
import { deleteConfiguredDailyGames, saveConfiguredDailyGames } from "@/lib/daily-games";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  try {
    const games = dailyGamesFromForm(data);
    const originalDate = String(data.get("originalDate") ?? "");
    await saveConfiguredDailyGames(games);
    if (originalDate && originalDate !== games.date) await deleteConfiguredDailyGames(originalDate).catch(() => undefined);
    return NextResponse.redirect(getRequestUrl(request, "/admin/games?saved=challenge"), 303);
  } catch {
    return NextResponse.redirect(getRequestUrl(request, "/admin/games?error=challenge"), 303);
  }
}
