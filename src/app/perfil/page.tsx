import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { rankUsers } from "@/lib/ranking";
import { isSectionEnabled } from "@/lib/sections";
import { getUsersByIds, listUsers } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";
import { listUserPointMovements } from "@/lib/points";
import { BsCalendarEvent, BsController, BsTicketPerforated } from "react-icons/bs";
import { ProfileEditDialog } from "@/features/users/ProfileEditDialog";
import { UserAvatar } from "@/features/users/UserAvatar";

export const metadata: Metadata = {
  title: "Perfil | Gallardo Camp 2026",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  if (!(await isSectionEnabled("profile"))) redirect("/");

  const cookieStore = await cookies();
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");

  const [users, allUsers] = await Promise.all([
    getUsersByIds(session.userIds),
    listUsers(),
  ]);
  const user = users.find((candidate) => candidate.id === session.activeUserId);
  if (!user) redirect("/login");
  const movements = await listUserPointMovements(user.id);
  const feedback = await searchParams;
  const rankedUser = rankUsers(allUsers).find(
    (candidate) => candidate.id === user.id,
  );

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative bg-[var(--primary-dark)] px-6 py-8 text-center text-white">
          <div className="absolute right-4 top-4"><ProfileEditDialog user={user} openInitially={Boolean(feedback.error)} /></div>
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
              <span className="block text-4xl font-black text-[var(--primary-dark)]">{rankedUser ? `${rankedUser.rank}.º` : "—"}</span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-600">ranking</span>
            </div>
          </div>
        </div>
      </section>
      {(feedback.saved || feedback.error) && <section className="mx-auto mt-6 max-w-xl">
        {feedback.saved && <p className="mb-4 rounded-xl bg-emerald-50 p-4 font-bold text-emerald-700">Perfil actualizado correctamente.</p>}
        {feedback.error && <p className="mb-4 rounded-xl bg-red-50 p-4 font-bold text-red-700">No se pudo actualizar el perfil. Revisa los datos.</p>}
      </section>}
      <section className="mx-auto mt-8 max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-black">Desglose de puntos</h2>
        <p className="mt-1 text-sm text-slate-600">Aquí puedes ver de dónde viene cada recompensa.</p>
        {movements.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">Todavía no hay movimientos registrados.</p>
        ) : (
          <ul className="mt-6 divide-y divide-slate-200">
            {movements.map((movement) => (
              <li key={movement.id} className="flex items-center gap-4 py-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-subtle)] text-xl text-[var(--primary)]">
                  {movement.source === "voucher" ? <BsTicketPerforated aria-hidden="true" /> : movement.source === "game" ? <BsController aria-hidden="true" /> : <BsCalendarEvent aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1"><span className="block truncate font-bold">{movement.concept}</span><span className="block text-sm text-slate-500">{movement.detail} · {movement.method === "qr" ? "QR" : movement.method === "game" ? "Minijuego" : "Asignación manual"}</span></span>
                <span className={`shrink-0 text-lg font-black ${movement.points < 0 ? "text-red-600" : "text-[var(--accent)]"}`}>{movement.points > 0 ? "+" : ""}{movement.points}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
