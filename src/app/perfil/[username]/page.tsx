import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { BsCalendarEvent, BsController, BsGift, BsTicketPerforated } from "react-icons/bs";
import { UserAvatar } from "@/features/users/UserAvatar";
import { listUserPointMovements } from "@/lib/points";
import { getRankedUsers } from "@/lib/ranking-data";
import { getRankingConfig } from "@/lib/ranking-mode";
import { canViewRankedUserScore } from "@/lib/ranking-privacy";
import { isSectionEnabled } from "@/lib/sections";
import { getUserByUsername } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const user = await getUserByUsername(decodeURIComponent((await params).username));
  return { title: user ? `${user.displayName} | Gallardo Camp 2026` : "Perfil | Gallardo Camp 2026" };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  if (!(await isSectionEnabled("profile"))) redirect("/");
  const username = decodeURIComponent((await params).username);
  const [user, rankedUsers, config, cookieStore] = await Promise.all([
    getUserByUsername(username),
    getRankedUsers(),
    getRankingConfig(),
    cookies(),
  ]);
  if (!user) notFound();
  const rankedUser = rankedUsers.find((candidate) => candidate.id === user.id);
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  const canViewScore = canViewRankedUserScore({
    hiddenMode: config.mode === "hidden",
    rank: rankedUser?.rank,
    profileUserId: user.id,
    viewerUserId: session?.activeUserId,
  });
  const movements = canViewScore ? await listUserPointMovements(user.id) : [];

  return <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-12">
    <section className="mx-auto max-w-xl">
      <Link href="/ranking" className="text-sm font-bold text-[var(--primary)]">← Volver al ranking</Link>
      <article className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[var(--primary-dark)] px-6 py-8 text-center text-white">
          <UserAvatar user={user} className="mx-auto h-28 w-28" textClassName="text-4xl" />
          <h1 className="mt-4 text-4xl font-black tracking-tight">{user.displayName}</h1>
          <p className="mt-2 text-emerald-100">@{user.username}</p>
          {user.status && <p className="mx-auto mt-4 max-w-sm text-sm italic leading-6 text-white/80">“{user.status}”</p>}
        </div>
        <div className="grid place-items-center p-6 sm:p-10">
          {canViewScore ? <div className="grid w-full max-w-sm grid-cols-2 divide-x divide-orange-200 rounded-3xl bg-[var(--accent-subtle)] px-4 py-4 text-center">
            <div className="px-3"><span className="block text-4xl font-black text-[var(--accent)]">{user.points}</span><span className="text-sm font-bold uppercase tracking-wider text-slate-600">puntos</span></div>
            <div className="px-3"><span className="block text-4xl font-black text-[var(--primary-dark)]">{rankedUser ? `${rankedUser.rank}.º` : "—"}</span><span className="text-sm font-bold uppercase tracking-wider text-slate-600">ranking</span></div>
          </div> : <div className="w-full max-w-sm rounded-3xl bg-violet-50 px-6 py-5 text-center"><strong className="block text-xl text-violet-800">Puntuación oculta</strong><span className="mt-1 block text-sm leading-6 text-violet-700">Este participante forma parte del top 5 secreto.</span></div>}
        </div>
      </article>

      {canViewScore && <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-black">Desglose de puntos</h2>
        <p className="mt-1 text-sm text-slate-600">Recompensas conseguidas durante el evento.</p>
        {movements.length === 0 ? <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">Todavía no hay movimientos registrados.</p> : <ul className="mt-6 divide-y divide-slate-200">{movements.map((movement) => <li key={movement.id} className="flex items-center gap-4 py-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-subtle)] text-xl text-[var(--primary)]">{movement.source === "voucher" ? <BsTicketPerforated /> : movement.source === "game" ? <BsController /> : movement.source === "lottery" ? <BsGift /> : <BsCalendarEvent />}</span><span className="min-w-0 flex-1"><span className="block truncate font-bold">{movement.concept}</span><span className="block text-sm text-slate-500">{movement.detail}</span></span><span className={`shrink-0 text-lg font-black ${movement.points < 0 ? "text-red-600" : "text-[var(--accent)]"}`}>{movement.points > 0 ? "+" : ""}{movement.points}</span></li>)}</ul>}
      </section>}
    </section>
  </main>;
}
