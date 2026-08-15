import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TapasContest } from "@/features/tapas/TapasContest";
import { isSectionEnabled } from "@/lib/sections";
import { getTalentContestState, listTalents, listTalentVotes, rankTalents } from "@/lib/talents";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const dynamic = "force-dynamic";
export default async function TalentsPage({ searchParams }: { searchParams: Promise<{ voted?: string; error?: string }> }) {
  if (!(await isSectionEnabled("talents"))) redirect("/");
  const [talents, votes, state, cookieStore, params] = await Promise.all([listTalents(), listTalentVotes(), getTalentContestState(), cookies(), searchParams]);
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value); const hasVoted = Boolean(session && votes.some((vote) => vote.userId === session.activeUserId)); const displayed = state === "ranking" ? rankTalents(talents, votes) : talents;
  return <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14"><section className="mx-auto max-w-6xl"><header className="mb-9 text-center"><p className="text-sm font-bold uppercase tracking-[.25em] text-[var(--accent)]">Gallardo Camp 2026</p><h1 className="mt-3 text-4xl font-black">Concurso de talentos</h1><p className="mx-auto mt-3 max-w-2xl text-slate-600">Descubre las actuaciones individuales y en grupo de la familia.</p></header>{params.voted && <p className="mb-6 rounded-2xl bg-emerald-50 p-4 text-center font-bold text-emerald-700">Tu voto se ha registrado correctamente.</p>}{params.error && <p className="mb-6 rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">{params.error === "duplicate" ? "Ya has emitido tu voto." : "Revisa que hayas elegido tres actuaciones diferentes."}</p>}<TapasContest tapas={displayed} state={state} loggedIn={Boolean(session)} hasVoted={hasVoted} voteAction="/talentos/vote" itemLabel="actuación" /></section></main>;
}
