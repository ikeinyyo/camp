import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BsCalendarEvent, BsController, BsTicketPerforated } from "react-icons/bs";
import { UserAvatar } from "@/features/users/UserAvatar";
import { listUserPointMovements } from "@/lib/points";
import { rankUsers } from "@/lib/ranking";
import { isSectionEnabled } from "@/lib/sections";
import { getUserByUsername, listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const user = await getUserByUsername(decodeURIComponent((await params).username));
  return { title: user ? `${user.displayName} | Gallardo Camp 2026` : "Perfil | Gallardo Camp 2026" };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  if (!(await isSectionEnabled("profile"))) redirect("/");
  const username = decodeURIComponent((await params).username);
  const [user, allUsers] = await Promise.all([getUserByUsername(username), listUsers()]);
  if (!user) notFound();
  const [movements, rankedUser] = await Promise.all([
    listUserPointMovements(user.id),
    Promise.resolve(rankUsers(allUsers).find((candidate) => candidate.id === user.id)),
  ]);

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
          <div className="grid w-full max-w-sm grid-cols-2 divide-x divide-orange-200 rounded-3xl bg-[var(--accent-subtle)] px-4 py-4 text-center">
            <div className="px-3"><span className="block text-4xl font-black text-[var(--accent)]">{user.points}</span><span className="text-sm font-bold uppercase tracking-wider text-slate-600">puntos</span></div>
            <div className="px-3"><span className="block text-4xl font-black text-[var(--primary-dark)]">{rankedUser ? `${rankedUser.rank}.º` : "—"}</span><span className="text-sm font-bold uppercase tracking-wider text-slate-600">ranking</span></div>
          </div>
        </div>
      </article>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-black">Desglose de puntos</h2>
        <p className="mt-1 text-sm text-slate-600">Recompensas conseguidas durante el evento.</p>
        {movements.length === 0 ? <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">Todavía no hay movimientos registrados.</p> : <ul className="mt-6 divide-y divide-slate-200">{movements.map((movement) => <li key={movement.id} className="flex items-center gap-4 py-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-subtle)] text-xl text-[var(--primary)]">{movement.source === "voucher" ? <BsTicketPerforated /> : movement.source === "game" ? <BsController /> : <BsCalendarEvent />}</span><span className="min-w-0 flex-1"><span className="block truncate font-bold">{movement.concept}</span><span className="block text-sm text-slate-500">{movement.detail}</span></span><span className={`shrink-0 text-lg font-black ${movement.points < 0 ? "text-red-600" : "text-[var(--accent)]"}`}>{movement.points > 0 ? "+" : ""}{movement.points}</span></li>)}</ul>}
      </section>
    </section>
  </main>;
}
