import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BsTrophyFill } from "react-icons/bs";
import { getRankedUsers } from "@/lib/ranking-data";
import { isSectionEnabled } from "@/lib/sections";
import { UserAvatar } from "@/features/users/UserAvatar";
import { FinalScoreCarousel } from "@/features/ranking/FinalScoreCarousel";
import { getRankingConfig } from "@/lib/ranking-mode";

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
  const [rankingEnabled, users, config] = await Promise.all([
    isSectionEnabled("ranking"),
    getRankedUsers(),
    getRankingConfig(),
  ]);
  if (!rankingEnabled) redirect("/");
  const tieBreakLabels = new Map<string, string>();
  for (let start = 0; start < users.length;) {
    let end = start + 1;
    while (end < users.length && users[end].points === users[start].points) end += 1;
    const group = users.slice(start, end);
    if (group.length > 1) {
      const criteria = [
        { value: (user: (typeof users)[number]) => user.rankingTieBreak.contestPrizePoints, label: (value: number) => `${value} pts en concursos` },
        { value: (user: (typeof users)[number]) => user.rankingTieBreak.activityParticipationPoints, label: (value: number) => `${value} pts en actividades` },
        { value: (user: (typeof users)[number]) => user.rankingTieBreak.organizationVoucherPoints, label: (value: number) => `${value} pts en Organización` },
        { value: (user: (typeof users)[number]) => user.rankingTieBreak.activitiesVoucherPoints, label: (value: number) => `${value} pts en vales de Actividades` },
        { value: (user: (typeof users)[number]) => user.rankingTieBreak.collaborationVoucherPoints, label: (value: number) => `${value} pts en Colaboración` },
        { value: (user: (typeof users)[number]) => user.rankingTieBreak.penaltyPoints, label: (value: number) => `${Math.abs(value)} pts de penalización` },
        { value: (user: (typeof users)[number]) => user.rankingTieBreak.completedActions, label: (value: number) => `${value} acciones completadas` },
      ];
      const decidingCriterion = criteria.find((criterion) => new Set(group.map(criterion.value)).size > 1);
      if (decidingCriterion) group.forEach((user) => tieBreakLabels.set(user.id, decidingCriterion.label(decidingCriterion.value(user))));
      else group.forEach((user) => tieBreakLabels.set(user.id, "Desempate temporal"));
    }
    start = end;
  }
  if (config.mode === "final")
    return <FinalScoreCarousel users={users} showPrizes={config.showPrizes} />;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent)]">
            Gallardo Camp 2026
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Ranking</h1>
          <p className="mt-3 text-slate-600">
            Clasificación general de participantes por puntos.
          </p>
        </header>

        {config.showPrizes && (
          <figure className="mt-8">
            <Image
              src="/images/premios.png"
              alt="Premios de la Gallardo Camp 2026"
              width={1672}
              height={941}
              priority
              className="h-auto w-full"
            />
            <figcaption className="mx-auto mt-3 max-w-xl text-center text-sm font-semibold leading-6 text-slate-600">
              Los tres ganadores elegirán uno de los premios por orden de
              clasificación.
            </figcaption>
          </figure>
        )}

        <details className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm shadow-sm">
          <summary className="cursor-pointer font-black text-[var(--primary-dark)]">¿Cómo se resuelven los empates?</summary>
          <ol className="mt-3 list-decimal space-y-1 pl-5 leading-6 text-slate-600">
            <li>Más puntos obtenidos por puestos en concursos.</li>
            <li>Más puntos de participación en actividades.</li>
            <li>Más puntos de vales de Organización.</li>
            <li>Más puntos de vales de Actividades y después de Colaboración.</li>
            <li>Menos penalizaciones y más acciones completadas.</li>
            <li>Quien alcanzó antes su puntuación actual.</li>
          </ol>
        </details>

        {users.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-600">
            Todavía no hay participantes en el ranking.
          </div>
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
                  <th scope="col" className="px-2 py-4 text-center sm:px-4">
                    Puesto
                  </th>
                  <th scope="col" className="px-2 py-4 sm:px-4">
                    Participante
                  </th>
                  <th scope="col" className="px-2 py-4 text-right sm:px-4">
                    Puntos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={
                      user.rank <= 3 ? "bg-[var(--primary-subtle)]/50" : ""
                    }
                  >
                    <td className="px-2 py-2.5 text-center sm:px-4 sm:py-4">
                      <span className="inline-flex items-center justify-center gap-1 text-base font-black text-[var(--primary-dark)] sm:gap-2 sm:text-lg">
                        {podiumStyles[user.rank] && (
                          <BsTrophyFill
                            aria-hidden="true"
                            className={podiumStyles[user.rank]}
                          />
                        )}
                        {user.rank}.º
                      </span>
                    </td>
                    <td className="min-w-0 px-2 py-2.5 sm:px-4 sm:py-4">
                      <Link
                        href={`/perfil/${encodeURIComponent(user.username)}`}
                        className="flex min-h-12 min-w-0 items-center gap-2 rounded-xl transition hover:text-[var(--primary)] focus-visible:outline-2 sm:min-h-14 sm:gap-3"
                      >
                        <UserAvatar
                          user={user}
                          className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
                        />
                        <span className="min-w-0 flex-1 overflow-hidden">
                          <span className="block truncate font-bold">
                            {user.displayName}
                          </span>
                          {tieBreakLabels.has(user.id) ? <span className="mt-0.5 flex min-w-0 items-center gap-2"><span className="max-w-full truncate rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-black text-orange-700 sm:text-xs">{tieBreakLabels.get(user.id)}</span><span className="hidden min-w-0 truncate text-sm text-slate-500 sm:block">{user.status || `@${user.username}`}</span></span> : <span className="block truncate text-sm leading-5 text-slate-500">{user.status || `@${user.username}`}</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap py-2.5 pl-2 pr-3 text-right text-lg font-black text-[var(--accent)] sm:px-4 sm:py-4 sm:text-xl">
                      {user.points}
                    </td>
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
