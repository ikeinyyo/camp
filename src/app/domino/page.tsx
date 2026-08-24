import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BsCheckCircleFill, BsDashCircle, BsTrophyFill } from "react-icons/bs";
import { UserAvatar } from "@/features/users/UserAvatar";
import { DOMINO_ROUNDS, getDominoTournament, type DominoTeam } from "@/lib/domino";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Campeonato de dominó | Gallardo Camp 2026" };

function Team({ team, compact = false }: { team?: DominoTeam; compact?: boolean }) {
  if (!team) return <span>Equipo pendiente</span>;
  return <span className="flex min-w-0 items-center gap-2">
    <span className="flex shrink-0 -space-x-2">{team.players.map((player) => <UserAvatar key={player.id} user={player} className={compact ? "h-8 w-8" : "h-10 w-10"} textClassName="text-xs" />)}</span>
    <span className="min-w-0 truncate font-bold">{team.players.map((player) => player.displayName).join(" y ")}</span>
  </span>;
}

export default async function DominoPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [tournament, params, cookieStore] = await Promise.all([getDominoTournament(), searchParams, cookies()]);
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");
  const registration = tournament.registrations.find((item) => item.userId === session.activeUserId);
  const currentMatches = tournament.matches.filter((match) => match.round === tournament.currentRound);
  const rounds = Array.from({ length: tournament.currentRound }, (_, index) => ({
    number: index + 1,
    matches: tournament.matches.filter((match) => match.round === index + 1),
  }));
  const tournamentFinished = tournament.currentRound === DOMINO_ROUNDS && currentMatches.length > 0 && currentMatches.every((match) => match.winnerTeamId);

  return <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14"><section className="mx-auto max-w-5xl">
    <header className="text-center">
      <p className="text-sm font-black uppercase tracking-[.25em] text-[var(--accent)]">Gallardo Camp 2026</p>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">Campeonato de dominó</h1>
      <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">Parejas fijas y tres rondas en formato suizo: os enfrentaréis a equipos con resultados similares y, siempre que sea posible, sin repetir rival.</p>
    </header>
    {params.saved && <p className="mx-auto mt-7 max-w-2xl rounded-2xl bg-emerald-50 p-4 text-center font-bold text-emerald-700">Tu respuesta se ha guardado.</p>}
    {params.error && <p className="mx-auto mt-7 max-w-2xl rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">La inscripción ya está cerrada.</p>}

    {tournament.mode === "registration" ? <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-center"><span className="inline-flex rounded-full bg-[var(--accent-subtle)] px-4 py-2 text-xs font-black uppercase tracking-wider text-[var(--accent-hover)]">Inscripción abierta</span><h2 className="mt-5 text-2xl font-black">¿Te apuntas al campeonato?</h2><p className="mt-2 text-slate-600">Puedes cambiar de opinión mientras no comience el torneo.</p></div>
      <form action="/domino/registration" method="post" className="mt-7 grid gap-3 sm:grid-cols-2">
        <button name="choice" value="joined" className={`min-h-16 rounded-2xl border-2 px-5 py-4 font-black transition ${registration?.choice === "joined" ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-slate-200 hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)]"}`}><BsCheckCircleFill className="mr-2 inline" /> Me apunto</button>
        <button name="choice" value="declined" className={`min-h-16 rounded-2xl border-2 px-5 py-4 font-black transition ${registration?.choice === "declined" ? "border-slate-600 bg-slate-700 text-white" : "border-slate-200 hover:bg-slate-50"}`}><BsDashCircle className="mr-2 inline" /> No me apunto</button>
      </form>
    </div> : <>
      {tournament.currentRound === 0 ? <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><h2 className="text-2xl font-black">Preparando las parejas</h2><p className="mt-3 text-slate-600">La inscripción ha terminado. Los emparejamientos aparecerán cuando comience la primera ronda.</p></div> : <>
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-wider text-[var(--accent)]">Ronda {tournament.currentRound} de {DOMINO_ROUNDS}</p><h2 className="mt-1 text-2xl font-black">Clasificación por parejas</h2></div>{tournamentFinished && <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-800"><BsTrophyFill className="mr-2 inline" />Clasificación final</span>}</div>
          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[3.5rem_1fr_4.5rem] bg-[var(--primary-dark)] px-4 py-3 text-xs font-black uppercase tracking-wider text-white sm:grid-cols-[6rem_1fr_7rem_7rem]"><span>Puesto</span><span>Pareja</span><span className="text-right">Victorias</span><span className="hidden text-right sm:block">Desempate</span></div>
            {tournament.standings.map((standing) => <div key={standing.teamId} className="grid grid-cols-[3.5rem_1fr_4.5rem] items-center border-t border-slate-100 px-4 py-3 sm:grid-cols-[6rem_1fr_7rem_7rem]"><strong className="text-lg">{standing.position}.º</strong><Team team={standing.team} compact /><strong className="text-right text-[var(--accent)]">{standing.wins}</strong><span className="hidden text-right text-sm text-slate-500 sm:block">{standing.buchholz}</span></div>)}
          </div>
        </section>
        <section className="mt-10"><h2 className="text-2xl font-black">Rondas y resultados</h2><div className="mt-5 grid gap-7">{rounds.map((round) => { const complete = round.matches.every((match) => Boolean(match.winnerTeamId)); return <div key={round.number}><div className="flex items-center gap-3"><h3 className="text-xl font-black">Ronda {round.number}</h3><span className={`rounded-full px-3 py-1 text-xs font-black ${complete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{complete ? "Completada" : "En juego"}</span></div><div className="mt-3 grid gap-4 sm:grid-cols-2">{round.matches.map((match) => <article key={match.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">{match.bye ? "Descansa esta ronda" : `Mesa ${match.tableNumber}`}</p><div className="mt-4 grid gap-3"><div className={match.winnerTeamId === match.team1Id ? "text-[var(--primary)]" : ""}><Team team={match.team1} compact />{match.winnerTeamId === match.team1Id && <span className="mt-1 block text-xs font-black uppercase tracking-wider">Pareja ganadora</span>}</div>{match.team2 && <div className={match.winnerTeamId === match.team2Id ? "text-[var(--primary)]" : ""}><Team team={match.team2} compact />{match.winnerTeamId === match.team2Id && <span className="mt-1 block text-xs font-black uppercase tracking-wider">Pareja ganadora</span>}</div>}</div>{!match.winnerTeamId && <p className="mt-4 text-sm text-slate-500">Resultado pendiente</p>}</article>)}</div></div>; })}</div></section>
      </>}
    </>}
  </section></main>;
}
