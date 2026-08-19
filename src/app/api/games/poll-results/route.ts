import { NextRequest, NextResponse } from "next/server";
import { getConfiguredDailyGames, getDailyPollResults, listDailyGameAttempts } from "@/lib/daily-games";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export async function GET(request: NextRequest) {
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const [games, attempts] = await Promise.all([getConfiguredDailyGames(date), listDailyGameAttempts(session.activeUserId)]);
  if (!games || !attempts.some((attempt) => attempt.date === date && attempt.kind === "poll")) return NextResponse.json({ error: "Vota antes de consultar los resultados." }, { status: 403 });
  return NextResponse.json(await getDailyPollResults(date, games.poll.options.length));
}
