import Link from "next/link";
import { BsTrophyFill } from "react-icons/bs";
import type { PointMovement } from "@/lib/points";
import { getProfileHighlights } from "@/lib/profile-highlights";

const podiumStyle = {
  1: "border-amber-200 bg-amber-50 text-amber-800",
  2: "border-slate-200 bg-slate-50 text-slate-700",
  3: "border-orange-200 bg-orange-50 text-orange-800",
};

const positionLabel = { 1: "1.er puesto", 2: "2.º puesto", 3: "3.er puesto" };

export function ProfileHighlights({ movements, currentPoints, canViewPoints = true }: { movements: PointMovement[]; currentPoints: number; canViewPoints?: boolean }) {
  const { podiums, badges, pendingBadges, stats } = getProfileHighlights(movements, currentPoints);
  const visibleBadges = badges.filter((badge) => !("revealsPoints" in badge && badge.revealsPoints) || canViewPoints);
  const visiblePendingBadges = pendingBadges.filter((badge) => !badge.revealsPoints || canViewPoints);
  const participation = [
    { value: stats.activityCount, label: "Actividades", emoji: "🎯" },
    { value: stats.voucherCount, label: "Vales", emoji: "🎟️" },
    { value: stats.gameCount, label: "Juegos", emoji: "🎮" },
    { value: stats.activeDays, label: "Días sumando", emoji: "🔥" },
  ];

  return (
    <section className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-emerald-950 to-emerald-800 px-6 py-7 text-white sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Palmarés personal</p>
        <h2 className="mt-2 text-2xl font-black">Vitrina de logros</h2>
        <p className="mt-2 text-sm leading-6 text-emerald-100/80">Los mejores momentos y todo lo que ha aportado durante la Gallardo Camp.</p>
      </div>

      <div className="p-6 sm:p-8">
        {podiums.length > 0 ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {podiums.map((podium) => <Link key={`${podium.href}-${podium.position}`} href={podium.href} className={`flex items-center gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${podiumStyle[podium.position]}`}>
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow-sm"><span aria-hidden="true">{podium.emoji}</span><BsTrophyFill aria-hidden="true" className="absolute -bottom-1 -right-1 text-sm text-current" /></span>
            <span><strong className="block text-lg">{positionLabel[podium.position]}</strong><span className="text-sm font-semibold opacity-80">{podium.name}</span></span>
          </Link>)}
        </div> : <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5 text-center"><span className="text-3xl" aria-hidden="true">🏆</span><strong className="mt-2 block text-amber-900">La vitrina espera su primer podio</strong><span className="mt-1 block text-sm text-amber-800">Los puestos en tapas, talentos y dominó aparecerán aquí.</span></div>}

        <h3 className="mt-8 text-lg font-black">Participación</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {participation.map((item) => <div key={item.label} className="rounded-2xl bg-slate-50 px-3 py-4 text-center"><span className="text-xl" aria-hidden="true">{item.emoji}</span><strong className="mt-1 block text-2xl text-[var(--primary-dark)]">{item.value}</strong><span className="block text-[10px] font-black uppercase tracking-wide text-slate-500">{item.label}</span></div>)}
        </div>

        {visibleBadges.length > 0 && <><h3 className="mt-8 text-lg font-black">Insignias desbloqueadas</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{visibleBadges.map((badge) => <div key={badge.id} className="flex min-h-20 min-w-0 items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3"><span className="grid h-10 w-10 shrink-0 place-items-center text-2xl" aria-hidden="true">{badge.emoji}</span><span className="min-w-0"><strong className="block text-sm leading-5 text-violet-950">{badge.title}</strong><span className="mt-0.5 block text-xs leading-4 text-violet-700">{badge.description}</span></span></div>)}</div></>}
        {visiblePendingBadges.length > 0 && <><h3 className="mt-8 text-lg font-black">Próximas insignias</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{visiblePendingBadges.map((badge) => {
          const percentage = Math.min(100, Math.max(0, (badge.current / badge.target) * 100));
          return <div key={badge.id} className="min-h-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5"><div className="flex items-center gap-3"><span className="relative grid h-10 w-10 shrink-0 place-items-center text-2xl grayscale" aria-hidden="true">{badge.emoji}<span className="absolute -bottom-1 -right-1 text-xs">🔒</span></span><span className="min-w-0 flex-1"><strong className="block text-sm text-slate-700">{badge.title}</strong><span className="block text-xs font-semibold text-slate-500">{badge.current} de {badge.target}</span></span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-violet-400" style={{ width: `${percentage}%` }} /></div></div>;
        })}</div></>}
      </div>
    </section>
  );
}
