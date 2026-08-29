import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PointsInsights } from "@/features/users/PointsInsights";
import { UserAvatar } from "@/features/users/UserAvatar";
import { ProfileHighlights } from "@/features/users/ProfileHighlights";
import { ProfileParticipations } from "@/features/users/ProfileParticipations";
import { ShareProfileButton } from "@/features/users/ShareProfileButton";
import { listUserPointMovements } from "@/lib/points";
import { getRankedUsers } from "@/lib/ranking-data";
import { getRankingConfig } from "@/lib/ranking-mode";
import { canViewRankedUserScore, isRankHidden } from "@/lib/ranking-privacy";
import { getProfileParticipations } from "@/lib/profile-participations";
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
  const hiddenRank = isRankHidden(config.mode === "hidden", rankedUser?.rank);
  const [movements, participations] = await Promise.all([
    listUserPointMovements(user.id),
    getProfileParticipations(user.id),
  ]);

  return <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-12">
    <section className="mx-auto max-w-6xl">
      <Link href="/ranking" className="block text-sm font-bold text-[var(--primary)]">← Volver al ranking</Link>
      <article className="mx-auto mt-5 max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative bg-[var(--primary-dark)] px-6 py-8 text-center text-white">
          <div className="absolute right-4 top-4"><ShareProfileButton username={user.username} displayName={user.displayName} /></div>
          <UserAvatar user={user} className="mx-auto h-28 w-28" textClassName="text-4xl" />
          <h1 className="mt-4 text-4xl font-black tracking-tight">{user.displayName}</h1>
          <p className="mt-2 text-emerald-100">@{user.username}</p>
          {user.status && <p className="mx-auto mt-4 max-w-sm text-sm italic leading-6 text-white/80">“{user.status}”</p>}
        </div>
        <div className="grid place-items-center p-6 sm:p-10">
          {canViewScore ? <div className="grid w-full max-w-sm grid-cols-2 divide-x divide-orange-200 rounded-3xl bg-[var(--accent-subtle)] px-4 py-4 text-center">
            <div className="px-3"><span className="block text-4xl font-black text-[var(--accent)]">{user.points}</span><span className="text-sm font-bold uppercase tracking-wider text-slate-600">puntos</span></div>
            <div className="px-3"><span className="block text-3xl font-black text-[var(--primary-dark)] sm:text-4xl">{hiddenRank ? "Top 5" : rankedUser ? `${rankedUser.rank}.º` : "—"}</span><span className="text-sm font-bold uppercase tracking-wider text-slate-600">ranking</span></div>
          </div> : <div className="w-full max-w-sm rounded-3xl bg-violet-50 px-6 py-5 text-center"><strong className="block text-xl text-violet-800">Puntuación oculta</strong><span className="mt-1 block text-sm leading-6 text-violet-700">Este participante forma parte del top 5 secreto.</span></div>}
        </div>
      </article>

      <ProfileParticipations participations={participations} />
      <ProfileHighlights movements={movements} currentPoints={user.points} canViewPoints={canViewScore} />
      {canViewScore && <PointsInsights movements={movements} currentPoints={user.points} />}
    </section>
  </main>;
}
