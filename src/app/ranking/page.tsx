import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BsTrophyFill } from "react-icons/bs";
import { rankUsers } from "@/lib/ranking";
import { isSectionEnabled } from "@/lib/sections";
import { listUsers } from "@/lib/users";

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
            <table className="w-full border-collapse text-left">
              <thead className="bg-[var(--primary-dark)] text-xs font-bold uppercase tracking-wider text-white">
                <tr>
                  <th scope="col" className="w-20 px-4 py-4 text-center sm:w-28">Puesto</th>
                  <th scope="col" className="px-4 py-4">Participante</th>
                  <th scope="col" className="px-4 py-4 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className={user.rank <= 3 ? "bg-[var(--primary-subtle)]/50" : ""}>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center gap-2 text-lg font-black text-[var(--primary-dark)]">
                        {podiumStyles[user.rank] && <BsTrophyFill aria-hidden="true" className={podiumStyles[user.rank]} />}
                        {user.rank}.º
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block font-bold text-slate-900">{user.displayName}</span>
                      <span className="block text-sm text-slate-500">@{user.username}</span>
                    </td>
                    <td className="px-4 py-4 text-right text-xl font-black text-[var(--accent)]">{user.points}</td>
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
