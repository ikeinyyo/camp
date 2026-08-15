import type { ReactNode } from "react";
import type { ScheduleEvent } from "@/config/schedule";
import { MAP_ZONES } from "@/config/locations";

const days = [{ id: "friday", date: "Viernes 28 de agosto", shortDate: "Vie 28" }, { id: "saturday", date: "Sábado 29 de agosto", shortDate: "Sáb 29" }, { id: "sunday", date: "Domingo 30 de agosto", shortDate: "Dom 30" }];

export function ActivityForm({ action, activity, children }: { action: string; activity?: ScheduleEvent & { dayId: string; active: boolean }; children?: ReactNode }) {
  const input = "rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--accent)]";
  const day = days.find((item) => item.id === activity?.dayId) ?? days[0];
  return <form action={action} method="post" className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
    <label className="grid gap-2 text-sm font-bold">Día<select name="dayId" defaultValue={day.id} className={input}>{days.map((d) => <option key={d.id} value={d.id}>{d.date}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold">Título<input name="title" required defaultValue={activity?.title} className={input} /></label>
    <label className="grid gap-2 text-sm font-bold">Inicio<input name="start" type="time" required defaultValue={activity?.start} className={input} /></label><label className="grid gap-2 text-sm font-bold">Fin<input name="end" type="time" required defaultValue={activity?.end} className={input} /></label>
    <label className="grid gap-2 text-sm font-bold sm:col-span-2">Descripción<textarea name="description" required rows={4} defaultValue={activity?.description} className={input} /></label>
    <label className="grid gap-2 text-sm font-bold">Lugar<input name="location" list="event-locations" required defaultValue={activity?.location} className={input} /><datalist id="event-locations">{MAP_ZONES.map((zone) => <option key={zone.id} value={zone.name} />)}<option value="El Mirador" /></datalist></label><label className="grid gap-2 text-sm font-bold">Asistencia<select name="required" defaultValue={String(activity?.required ?? false)} className={input}><option value="false">Opcional</option><option value="true">Obligatoria</option></select></label>
    <label className="grid gap-2 text-sm font-bold">Puntos participación<input name="participationPoints" type="number" min={0} defaultValue={activity?.participationPoints ?? 0} className={input} /></label><label className="grid gap-2 text-sm font-bold">Estado<select name="active" defaultValue={String(activity?.active ?? true)} className={input}><option value="true">Activa</option><option value="false">Inactiva</option></select></label>
    <fieldset className="grid grid-cols-3 gap-3 sm:col-span-2"><legend className="mb-2 text-sm font-bold">Puntos por posición</legend>{(["first", "second", "third"] as const).map((key, index) => <label key={key} className="grid gap-2 text-xs font-bold">{index + 1}.º<input name={`${key}Points`} type="number" min={0} defaultValue={activity?.podiumPoints?.[key] ?? 0} className={input} /></label>)}</fieldset>
    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 sm:col-span-2">{children}<button className="rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white">Guardar actividad</button></div>
  </form>;
}
