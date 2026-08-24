import type { Metadata } from "next";
import Link from "next/link";
import { BsCheckCircleFill, BsPeopleFill, BsTrophyFill } from "react-icons/bs";
import { AdminNavigation } from "@/features/admin/AdminNavigation";
import { ResetDominoButton } from "@/features/admin/ResetDominoButton";
import { UserAvatar } from "@/features/users/UserAvatar";
import { DOMINO_ROUNDS, getDominoTournament, type DominoTeam } from "@/lib/domino";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dominó | Administración" };

function Team({ team }: { team?: DominoTeam }) {
  if (!team) return <span>Pareja pendiente</span>;
  return <span className="flex min-w-0 items-center gap-3"><span className="flex shrink-0 -space-x-2">{team.players.map((player) => <UserAvatar key={player.id} user={player} className="h-9 w-9" textClassName="text-xs" />)}</span><span className="min-w-0 truncate">{team.players.map((player) => player.displayName).join(" y ")}</span></span>;
}

export default async function AdminDominoPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; message?: string }> }) {
  const [tournament, params, users] = await Promise.all([getDominoTournament(), searchParams, listUsers()]);
  const approvedUsers = users.filter((user) => user.approved);
  const registrationByUser = new Map(tournament.registrations.map((registration) => [registration.userId, registration.choice]));
  const joined = tournament.registrations.filter((item) => item.choice === "joined");
  const declined = tournament.registrations.filter((item) => item.choice === "declined");
  const validParticipants = joined.length >= 4 && joined.length % 2 === 0;
  const currentMatches = tournament.matches.filter((match) => match.round === tournament.currentRound);
  const pending = currentMatches.filter((match) => !match.bye && !match.winnerTeamId).length;
  const canStart = tournament.mode === "tournament" && tournament.currentRound < DOMINO_ROUNDS && validParticipants && pending === 0;

  return <main className="min-h-screen px-4 py-7 sm:px-6 sm:py-12"><div className="mx-auto max-w-7xl">
    <header className="flex flex-col items-stretch gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--accent)]">Administración</p><h1 className="mt-2 text-3xl font-bold">Campeonato de dominó</h1></div><Link href="/domino" className="rounded-xl bg-[var(--accent)] px-4 py-2 text-center text-sm font-bold text-white">Ver campeonato</Link></header>
    <AdminNavigation active="domino" />
    {params.saved && <p className="mt-6 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-700">Operación realizada correctamente.</p>}
    {params.error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{params.message ?? "No se pudo realizar la operación."}</p>}

    <section className="grid gap-5 py-7 lg:grid-cols-[1fr_1.4fr]">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wider text-[var(--accent)]">Estado</p><h2 className="mt-2 text-2xl font-black">{tournament.mode === "registration" ? "Inscripción abierta" : tournament.currentRound === 0 ? "Parejas pendientes" : `Torneo · Ronda ${tournament.currentRound} de ${DOMINO_ROUNDS}`}</h2>
        <p className="mt-2 leading-6 text-slate-600">{tournament.mode === "registration" ? "Los usuarios todavía pueden confirmar o rechazar su participación." : tournament.currentRound === 0 ? "La inscripción está cerrada. Sortea las parejas para comenzar." : pending > 0 ? `Quedan ${pending} resultados por registrar.` : tournament.currentRound < DOMINO_ROUNDS ? "Todos los resultados están listos para crear los siguientes enfrentamientos." : "Las tres rondas han terminado."}</p>
        {tournament.mode === "registration" ? <form action="/admin/domino/mode" method="post" className="mt-6"><button name="mode" value="tournament" disabled={!validParticipants} className="w-full rounded-xl bg-[var(--accent)] px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">Cerrar inscripción y activar torneo</button>{!validParticipants && <p className="mt-2 text-xs text-slate-500">Se necesita un número par de participantes y al menos cuatro inscritos.</p>}</form> : tournament.currentRound < DOMINO_ROUNDS && <form action="/admin/domino/rounds/start" method="post" className="mt-6"><button disabled={!canStart} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{tournament.currentRound === 0 ? "Sortear parejas y empezar ronda 1" : `Crear enfrentamientos y empezar ronda ${tournament.currentRound + 1}`}</button></form>}
        {(tournament.mode === "tournament" || tournament.teams.length > 0) && <div className="mt-3"><ResetDominoButton /></div>}
      </article>
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Inscripciones</p><h2 className="mt-2 text-2xl font-black">{joined.length} participantes</h2></div><BsPeopleFill className="text-3xl text-[var(--primary)]" /></div><div className="mt-5 flex flex-wrap gap-2">{joined.map((item) => item.user && <span key={item.userId} className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-subtle)] py-1.5 pl-1.5 pr-3 text-sm font-bold"><UserAvatar user={item.user} className="h-7 w-7" textClassName="text-xs" />{item.user.displayName}</span>)}</div>{declined.length > 0 && <p className="mt-5 text-sm text-slate-500">No participan: {declined.map((item) => item.user?.displayName).filter(Boolean).join(", ")}.</p>}</article>
    </section>

    <section className="pb-8"><div><h2 className="text-2xl font-black">Gestionar participantes</h2><p className="mt-2 text-slate-600">Puedes apuntar o desapuntar usuarios mientras la inscripción esté abierta.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{approvedUsers.map((user) => { const choice = registrationByUser.get(user.id); return <article key={user.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex min-w-0 items-center gap-3"><UserAvatar user={user} className="h-10 w-10" textClassName="text-sm" /><div className="min-w-0"><p className="truncate font-black">{user.displayName}</p><p className="truncate text-xs text-slate-500">@{user.username}</p></div></div><form action={`/admin/domino/registrations/${user.id}`} method="post" className="mt-4 grid grid-cols-2 gap-2"><button name="choice" value="joined" disabled={tournament.mode !== "registration"} className={`rounded-lg border px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${choice === "joined" ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-slate-200"}`}>Apuntado</button><button name="choice" value="declined" disabled={tournament.mode !== "registration"} className={`rounded-lg border px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${choice === "declined" ? "border-slate-600 bg-slate-700 text-white" : "border-slate-200"}`}>No participa</button></form></article>; })}</div></section>

    {tournament.teams.length > 0 && <section className="pb-8"><h2 className="text-2xl font-black">Parejas del campeonato</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tournament.teams.map((team, index) => <div key={team.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Pareja {index + 1}</p><Team team={team} /></div>)}</div></section>}

    {tournament.mode === "tournament" && tournament.currentRound > 0 && <>
      <section className="pb-8"><div className="flex items-center gap-3"><h2 className="text-2xl font-black">Ronda {tournament.currentRound}</h2>{pending === 0 && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"><BsCheckCircleFill className="mr-1 inline" />Completa</span>}</div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{currentMatches.map((match) => <article key={match.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">{match.bye ? "Descanso" : `Mesa ${match.tableNumber}`}</p>{match.bye ? <div className="mt-4 font-black text-[var(--primary)]"><Team team={match.team1} /><p className="mt-2 text-xs uppercase tracking-wider">Suma una victoria</p></div> : <form action={`/admin/domino/matches/${match.id}/winner`} method="post" className="mt-4 grid gap-2"><p className="mb-1 text-sm text-slate-500">Marca la pareja ganadora:</p>{[match.team1, match.team2].map((team) => team && <button key={team.id} name="winnerTeamId" value={team.id} className={`rounded-xl border-2 p-3 text-left font-bold transition ${match.winnerTeamId === team.id ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary-dark)]" : "border-slate-200 hover:border-[var(--primary)]"}`}><span className="flex items-center gap-2"><span className="min-w-0 flex-1"><Team team={team} /></span>{match.winnerTeamId === team.id && <BsTrophyFill className="shrink-0 text-amber-500" />}</span></button>)}</form>}</article>)}</div></section>
      <section className="pb-10"><h2 className="text-2xl font-black">Clasificación provisional</h2><div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[640px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600"><tr><th className="p-4">Puesto</th><th className="p-4">Pareja</th><th className="p-4 text-center">Victorias</th><th className="p-4 text-center">Derrotas</th><th className="p-4 text-center">Buchholz</th></tr></thead><tbody className="divide-y divide-slate-200">{tournament.standings.map((standing) => <tr key={standing.teamId}><td className="p-4 font-black">{standing.position}.º</td><td className="p-4"><Team team={standing.team} /></td><td className="p-4 text-center font-black text-[var(--primary)]">{standing.wins}</td><td className="p-4 text-center">{standing.losses}</td><td className="p-4 text-center text-slate-500">{standing.buchholz}</td></tr>)}</tbody></table></div></section>
    </>}
  </div></main>;
}
