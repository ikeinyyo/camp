import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BsTrophyFill } from "react-icons/bs";
import { rankUsers } from "@/lib/ranking";
import { isSectionEnabled } from "@/lib/sections";
import { listUsers } from "@/lib/users";
import { UserAvatar } from "@/features/users/UserAvatar";

export const metadata: Metadata = {
  title: "Ranking | Gallardo Camp 2026",
};

export const dynamic = "force-dynamic";

const podiumStyles: Record<number, string> = {
  1: "text-amber-500",
  2: "text-slate-400",
  3: "text-orange-700",
};

export default async function RankingPage() {
  const [rankingEnabled, allUsers] = await Promise.all([
    isSectionEnabled("ranking"),
    listUsers(),
  ]);
  if (!rankingEnabled) redirect("/");
  const users = rankUsers(allUsers);

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Gallardo Camp 2026</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Ranking</h1>
          <p className="mt-3 text-slate-600">Clasificación general de participantes por puntos.</p>
        </header>

        {users.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-600">Todavía no hay participantes en el ranking.</div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[5rem] sm:w-28" />
                <col />
                <col className="w-[4.5rem] sm:w-28" />
              </colgroup>
              <thead className="bg-[var(--primary-dark)] text-xs font-bold uppercase tracking-wider text-white">
                <tr>
                  <th scope="col" className="px-2 py-4 text-center sm:px-4">Puesto</th>
                  <th scope="col" className="px-2 py-4 sm:px-4">Participante</th>
                  <th scope="col" className="px-2 py-4 text-right sm:px-4">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className={user.rank <= 3 ? "bg-[var(--primary-subtle)]/50" : ""}>
                    <td className="px-2 py-2.5 text-center sm:px-4 sm:py-4">
                      <span className="inline-flex items-center justify-center gap-1 text-base font-black text-[var(--primary-dark)] sm:gap-2 sm:text-lg">
                        {podiumStyles[user.rank] && <BsTrophyFill aria-hidden="true" className={podiumStyles[user.rank]} />}
                        {user.rank}.º
                      </span>
                    </td>
                    <td className="min-w-0 px-2 py-2.5 sm:px-4 sm:py-4">
                      <Link href={`/perfil/${encodeURIComponent(user.username)}`} className="flex min-h-12 min-w-0 items-center gap-2 rounded-xl transition hover:text-[var(--primary)] focus-visible:outline-2 sm:min-h-14 sm:gap-3"><UserAvatar user={user} className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" /><span className="min-w-0 flex-1 overflow-hidden"><span className="block truncate font-bold">{user.displayName}</span><span className="block truncate text-sm leading-5 text-slate-500">{user.status || `@${user.username}`}</span></span></Link>
                    </td>
                    <td className="whitespace-nowrap py-2.5 pl-2 pr-3 text-right text-lg font-black text-[var(--accent)] sm:px-4 sm:py-4 sm:text-xl">{user.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
