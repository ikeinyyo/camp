import { NextRequest, NextResponse } from "next/server";
import { getMadridDate, type DailyGameKind } from "@/config/daily-games";
import { getConfiguredDailyGames, getDailyPollResults, submitDailyGameAttempt, DailyGameAlreadyAttemptedError, DailyGameUnavailableError } from "@/lib/daily-games";
import { isSectionEnabled } from "@/lib/sections";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export async function POST(request: NextRequest) {
  if (!(await isSectionEnabled("games"))) return NextResponse.json({ error: "Sección no disponible." }, { status: 404 });
  const session = readUserSessionToken(request.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  try {
    const body = await request.json() as { date?: string; kind?: DailyGameKind; answer?: string };
    const attempt = await submitDailyGameAttempt(session.activeUserId, String(body.date ?? ""), body.kind as DailyGameKind, String(body.answer ?? ""));
    const games = await getConfiguredDailyGames(getMadridDate());
    const explanation = games && body.kind && body.kind !== "poll" ? games[body.kind].explanation : undefined;
    const pollResults = body.kind === "poll" && games ? await getDailyPollResults(games.date, games.poll.options.length) : undefined;
    return NextResponse.json({ attempt, explanation, pollResults });
  } catch (error) {
    const message = error instanceof DailyGameAlreadyAttemptedError ? "Ya habías respondido este reto." : error instanceof DailyGameUnavailableError ? error.message : "No se pudo guardar el intento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
