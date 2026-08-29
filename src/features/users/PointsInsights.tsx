import {
  BsCalendarEvent,
  BsController,
  BsGift,
  BsTicketPerforated,
} from "react-icons/bs";
import type { PointMovement } from "@/lib/points";
import {
  getPointInsights,
  type PointInsightSource,
} from "@/lib/point-insights";

const sourceDetails: Record<PointInsightSource, { label: string; description: string; color: string }> = {
  activity: { label: "Actividades", description: "Participación y premios", color: "#059669" },
  voucher: { label: "Vales", description: "Tareas y colaboración", color: "#ea580c" },
  game: { label: "Juegos", description: "Juegos diarios", color: "#2563eb" },
  lottery: { label: "Sorteos", description: "Premios de la suerte", color: "#9333ea" },
  adjustment: { label: "Ajustes", description: "Puntuación inicial o manual", color: "#64748b" },
};

function movementIcon(source: PointMovement["source"]) {
  if (source === "voucher") return <BsTicketPerforated aria-hidden="true" />;
  if (source === "game") return <BsController aria-hidden="true" />;
  if (source === "lottery") return <BsGift aria-hidden="true" />;
  return <BsCalendarEvent aria-hidden="true" />;
}

function movementMethod(method: PointMovement["method"]) {
  if (method === "qr") return "QR";
  if (method === "game") return "Minijuego";
  return "Asignación manual";
}

function movementDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  }).format(date);
}

export function PointsInsights({ movements, currentPoints }: { movements: PointMovement[]; currentPoints: number }) {
  const insights = getPointInsights(movements, currentPoints);
  const earnedCategories = insights.categories.filter((category) => category.earned > 0);
  const chartSegments = earnedCategories
    .map((category, index) => {
      const start = earnedCategories
        .slice(0, index)
        .reduce((total, item) => total + (item.earned / insights.earned) * 100, 0);
      const end = start + (category.earned / insights.earned) * 100;
      return `${sourceDetails[category.source].color} ${start}% ${end}%`;
    });
  const chartBackground = chartSegments.length > 0
    ? `conic-gradient(${chartSegments.join(", ")})`
    : "#e2e8f0";

  return (
    <section className="mx-auto mt-8 max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black">De dónde vienen los puntos</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">Resumen de recompensas, participación y penalizaciones.</p>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center sm:gap-3">
        <div className="rounded-2xl bg-emerald-50 px-2 py-4"><strong className="block text-xl text-emerald-700 sm:text-2xl">+{insights.earned}</strong><span className="text-[10px] font-black uppercase tracking-wide text-emerald-800 sm:text-xs">Ganados</span></div>
        <div className="rounded-2xl bg-slate-100 px-2 py-4"><strong className="block text-xl text-slate-700 sm:text-2xl">{insights.movementCount}</strong><span className="text-[10px] font-black uppercase tracking-wide text-slate-600 sm:text-xs">Movimientos</span></div>
        <div className="rounded-2xl bg-orange-50 px-2 py-4"><strong className="block text-xl text-orange-700 sm:text-2xl">{insights.categories.filter((category) => category.earned > 0).length}</strong><span className="text-[10px] font-black uppercase tracking-wide text-orange-800 sm:text-xs">Formas de sumar</span></div>
      </div>
      {insights.penalties > 0 && <p className="mt-3 text-center text-xs font-semibold text-slate-500">El balance incluye {insights.penalties} {insights.penalties === 1 ? "punto descontado" : "puntos descontados"}.</p>}

      <figure className="mt-8 grid items-center gap-7 sm:grid-cols-[11rem_1fr]">
        <div className="relative mx-auto grid h-40 w-40 place-items-center rounded-full" style={{ background: chartBackground }} role="img" aria-label={`Distribución de ${insights.earned} puntos ganados por origen`}>
          <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-inner"><span><strong className="block text-2xl text-[var(--primary-dark)]">{currentPoints}</strong><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">puntos</span></span></div>
        </div>
        <figcaption className="grid gap-4">
          {insights.categories.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">Todavía no hay puntos que representar.</p> : insights.categories.map((category) => {
            const detail = sourceDetails[category.source];
            const percentage = insights.earned > 0 ? (category.earned / insights.earned) * 100 : 0;
            return <div key={category.source}>
              <div className="flex items-end justify-between gap-3 text-sm"><span><strong className="block text-slate-800">{detail.label}</strong><span className="text-xs text-slate-500">{detail.description}</span></span><span className="shrink-0 font-black"><span style={{ color: detail.color }}>+{category.earned}</span>{category.penalties > 0 && <span className="ml-2 text-red-600">−{category.penalties}</span>}</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: detail.color }} /></div>
            </div>;
          })}
        </figcaption>
      </figure>

      <div className="mt-9 border-t border-slate-200 pt-7">
        <h3 className="text-xl font-black">Historial de puntos</h3>
        {movements.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">Todavía no hay movimientos registrados.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {movements.map((movement) => (
              <li key={movement.id} className="flex items-center gap-3 py-4 sm:gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-subtle)] text-xl text-[var(--primary)]">{movementIcon(movement.source)}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-bold">{movement.concept}</span><span className="block truncate text-xs text-slate-500 sm:text-sm">{movement.detail} · {movementMethod(movement.method)}</span><span className="mt-0.5 block text-xs capitalize text-slate-400">{movementDate(movement.createdAt)}</span></span>
                <span className={`shrink-0 text-lg font-black ${movement.points < 0 ? "text-red-600" : "text-[var(--accent)]"}`}>{movement.points > 0 ? "+" : ""}{movement.points}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
