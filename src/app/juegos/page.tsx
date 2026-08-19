import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMadridDate } from "@/config/daily-games";
import { DailyGamesBoard, type PublicDailyGames } from "@/features/games/DailyGamesBoard";
import { calculateDailyGameStreak, getConfiguredDailyGames, getDailyPollResults, listDailyGameAttempts } from "@/lib/daily-games";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Minijuegos | Gallardo Camp 2026" };

export default async function GamesPage() {
  const session = readUserSessionToken((await cookies()).get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");
  const date = getMadridDate();
  const [games, attempts] = await Promise.all([getConfiguredDailyGames(date), listDailyGameAttempts(session.activeUserId)]);

  if (!games) return <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14"><section className="mx-auto max-w-2xl text-center"><p className="text-sm font-black uppercase tracking-[.25em] text-[var(--accent)]">Minijuegos diarios</p><h1 className="mt-3 text-4xl font-black">Hoy no hay nuevos retos</h1><p className="mt-4 leading-7 text-slate-600">Vuelve mañana para descubrir una nueva trivia, palabra y encuesta familiar.</p><div className="mx-auto mt-8 max-w-md"><Image src="/images/games-placeholder.png" alt="Los minijuegos de la Gallardo Camp estarán disponibles próximamente" width={1254} height={1254} className="h-auto w-full" priority /></div></section></main>;

  const publicGames: PublicDailyGames = {
    date,
    trivia: { prompt: games.trivia.prompt, options: games.trivia.options },
    word: { prompt: games.word.prompt, length: games.word.answer.length, hint: games.word.hint },
    poll: { prompt: games.poll.prompt, options: games.poll.options },
  };
  const todayAttempts = attempts.filter((attempt) => attempt.date === date);
  const streak = calculateDailyGameStreak(attempts, date);
  const pollResults = todayAttempts.some((attempt) => attempt.kind === "poll") ? await getDailyPollResults(date, games.poll.options.length) : undefined;

  return <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14"><section className="mx-auto max-w-7xl"><header className="mb-9 text-center"><p className="text-sm font-black uppercase tracking-[.25em] text-[var(--accent)]">Un punto por cada reto</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Minijuegos diarios</h1><p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">Trivia y palabra con una sola oportunidad, más una encuesta para conocer la opinión de la familia.</p></header><DailyGamesBoard games={publicGames} initialAttempts={todayAttempts} initialStreak={streak} initialPollResults={pollResults} /></section></main>;
}
