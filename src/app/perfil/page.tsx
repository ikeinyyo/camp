import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRankedUsers } from "@/lib/ranking-data";
import { getRankingConfig } from "@/lib/ranking-mode";
import { isRankHidden } from "@/lib/ranking-privacy";
import { isSectionEnabled } from "@/lib/sections";
import { getUsersByIds } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";
import { listUserPointMovements } from "@/lib/points";
import { ProfileEditDialog } from "@/features/users/ProfileEditDialog";
import { ProfileHighlights } from "@/features/users/ProfileHighlights";
import { ProfileParticipations } from "@/features/users/ProfileParticipations";
import { PointsInsights } from "@/features/users/PointsInsights";
import { ShareProfileButton } from "@/features/users/ShareProfileButton";
import { UserAvatar } from "@/features/users/UserAvatar";
import { getProfileParticipations } from "@/lib/profile-participations";

export const metadata: Metadata = {
  title: "Perfil | Gallardo Camp 2026",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (!(await isSectionEnabled("profile"))) redirect("/");

  const cookieStore = await cookies();
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");

  const [users, rankedUsers, rankingConfig] = await Promise.all([
    getUsersByIds(session.userIds),
    getRankedUsers(),
    getRankingConfig(),
  ]);
  const user = users.find((candidate) => candidate.id === session.activeUserId);
  if (!user) redirect("/login");
  const [movements, feedback, participations] = await Promise.all([
    listUserPointMovements(user.id),
    searchParams,
    getProfileParticipations(user.id),
  ]);
  const rankedUser = rankedUsers.find(
    (candidate) => candidate.id === user.id,
  );
  const hiddenRank = isRankHidden(
    rankingConfig.mode === "hidden",
    rankedUser?.rank,
  );

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative bg-[var(--primary-dark)] px-6 py-8 text-center text-white">
          <div className="absolute right-4 top-4 flex gap-2"><ShareProfileButton username={user.username} displayName={user.displayName} /><ProfileEditDialog user={user} openInitially={Boolean(feedback.error)} /></div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-400">
            Perfil activo
          </p>
          <UserAvatar user={user} className="mx-auto mt-4 h-28 w-28" textClassName="text-4xl" />
          <h1 className="mt-4 text-4xl font-black tracking-tight">{user.displayName}</h1>
          <p className="mt-2 text-emerald-100">@{user.username}</p>
          {user.status && <p className="mx-auto mt-4 max-w-sm text-sm italic text-white/80">“{user.status}”</p>}
        </div>
        <div className="grid place-items-center p-6 sm:p-10">
          <div className="grid w-full max-w-sm grid-cols-2 divide-x divide-orange-200 rounded-3xl bg-[var(--accent-subtle)] px-4 py-4 text-center">
            <div className="px-3">
              <span className="block text-4xl font-black text-[var(--accent)]">{user.points}</span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-600">puntos</span>
            </div>
            <div className="px-3">
              <span className="block text-3xl font-black text-[var(--primary-dark)] sm:text-4xl">{hiddenRank ? "Top 5" : rankedUser ? `${rankedUser.rank}.º` : "—"}</span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-600">ranking</span>
            </div>
          </div>
        </div>
      </section>
      {(feedback.saved || feedback.error) && <section className="mx-auto mt-6 max-w-6xl">
        {feedback.saved && <p className="mb-4 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-700">Perfil actualizado correctamente.</p>}
        {feedback.error && <p className="mb-4 rounded-xl bg-red-50 p-4 font-bold text-red-700">No se pudo actualizar el perfil. Revisa los datos.</p>}
      </section>}
      <ProfileParticipations participations={participations} />
      <ProfileHighlights movements={movements} currentPoints={user.points} />
      <PointsInsights movements={movements} currentPoints={user.points} />
    </main>
  );
}
