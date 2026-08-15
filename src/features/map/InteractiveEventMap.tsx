"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BsCalendarEvent, BsClock, BsGeoAltFill } from "react-icons/bs";
import { MAP_ZONES, type MapZoneId } from "@/config/locations";
import type { ScheduleEvent } from "@/config/schedule";
import { ScheduleEventDialog } from "@/features/schedule/Schedule";

export type MapActivity = {
  id: string;
  zoneId?: MapZoneId;
  title: string;
  description: string;
  date: string;
  shortDate: string;
  start: string;
  end: string;
  location: string;
  required: boolean;
  participationPoints: number;
  podiumPoints?: ScheduleEvent["podiumPoints"];
};

const shapes: Record<MapZoneId, { polygon: string; labelLeft: string; labelTop: string; label: string }> = {
  pool: { polygon: "27% 7%, 53% 5%, 55% 18%, 25% 20%, 20% 15%", labelLeft: "36%", labelTop: "15%", label: "Piscina" },
  gazebo: { polygon: "54% 6%, 88% 10%, 92% 23%, 55% 22%", labelLeft: "84%", labelTop: "19%", label: "Cenador" },
  house: { polygon: "56% 22%, 91% 23%, 85% 45%, 50% 43%", labelLeft: "69%", labelTop: "36%", label: "Casa" },
  "central-plaza": { polygon: "43% 40%, 85% 43%, 77% 61%, 37% 57%", labelLeft: "62%", labelTop: "53%", label: "Plaza Central" },
  "west-grove": { polygon: "15% 19%, 54% 18%, 46% 43%, 9% 40%", labelLeft: "29%", labelTop: "33%", label: "Pinada Oeste" },
  court: { polygon: "6% 39%, 43% 42%, 34% 68%, 1% 61%", labelLeft: "20%", labelTop: "56%", label: "Pista" },
  "south-grove": { polygon: "38% 55%, 78% 59%, 69% 91%, 28% 82%", labelLeft: "53%", labelTop: "75%", label: "Pinada Sur" },
};

export function InteractiveEventMap({ activities, initialZoneId, canRequestPoints = false }: { activities: MapActivity[]; initialZoneId?: MapZoneId; canRequestPoints?: boolean }) {
  const firstWithEvents = MAP_ZONES.find((zone) => activities.some((activity) => activity.zoneId === zone.id));
  const [selectedId, setSelectedId] = useState<MapZoneId>(initialZoneId ?? firstWithEvents?.id ?? "court");
  const [selectedActivity, setSelectedActivity] = useState<MapActivity | null>(null);
  const selectedZone = MAP_ZONES.find((zone) => zone.id === selectedId)!;
  const selectedActivities = useMemo(() => activities.filter((activity) => activity.zoneId === selectedId), [activities, selectedId]);
  const externalActivities = activities.filter((activity) => !activity.zoneId);

  function selectZone(zoneId: MapZoneId) {
    setSelectedId(zoneId);
    window.requestAnimationFrame(() => document.getElementById("zone-events")?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }

  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)] lg:items-start">
    <section className="min-w-0 p-0 sm:p-2">
      <div className="mb-2 flex items-center justify-between gap-2 px-2 pt-2 sm:mb-4 sm:gap-3 sm:px-1 sm:pt-0"><div><h2 className="font-black text-[var(--primary-dark)]">Plano del recinto</h2><p className="text-xs text-slate-500">Toca una zona para consultar sus actividades</p></div><span className="hidden rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--accent)] sm:inline-flex">Plano orientativo</span></div>
      <div className="relative mx-auto w-full max-w-[720px] drop-shadow-[0_18px_20px_rgb(5_46_22/0.18)]">
        <Image src="/venue.png?v=20260815-2" alt="Plano ilustrado del recinto Gallardo Camp" width={1312} height={1199} priority unoptimized className="h-auto w-full" />
        {MAP_ZONES.map((zone) => {
          const shape = shapes[zone.id];
          return <button
            key={`hotspot-${zone.id}`}
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => selectZone(zone.id)}
            className="absolute inset-0 cursor-pointer bg-transparent"
            style={{ clipPath: `polygon(${shape.polygon})` }}
          />;
        })}
        {MAP_ZONES.map((zone) => {
          const shape = shapes[zone.id];
          const active = zone.id === selectedId;
          const count = activities.filter((activity) => activity.zoneId === zone.id).length;
          return <button
            key={`label-${zone.id}`}
            type="button"
            aria-label={`${zone.name}, ${count} actividades`}
            aria-pressed={active}
            onClick={() => selectZone(zone.id)}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-black shadow-md transition sm:text-sm ${active ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-slate-200 bg-white/95 text-[var(--primary-dark)]"}`}
            style={{ left: shape.labelLeft, top: shape.labelTop }}
          >
            {shape.label}
            {count > 0 && <span className="ml-1.5 inline-grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] text-white ring-2 ring-white">{count}</span>}
          </button>;
        })}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">{MAP_ZONES.map((zone) => <button key={zone.id} type="button" onClick={() => selectZone(zone.id)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${selectedId === zone.id ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--primary-border)] bg-white text-[var(--primary-dark)] hover:bg-[var(--primary-subtle)]"}`}>{zone.shortName}</button>)}</div>
    </section>

    <div id="zone-events" className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
      <div className="flex items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent-subtle)] text-xl text-[var(--accent)]"><BsGeoAltFill /></span><div><p className="text-xs font-black uppercase tracking-[.18em] text-[var(--accent)]">Zona seleccionada</p><h2 className="mt-1 text-2xl font-black">{selectedZone.name}</h2><p className="mt-1 text-sm text-slate-600">{selectedZone.description}</p></div></div>
      {selectedActivities.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><BsCalendarEvent className="mx-auto text-3xl text-slate-400" /><p className="mt-3 font-bold text-slate-600">No hay actividades programadas aquí.</p></div> : <ul className="mt-6 grid gap-3">{selectedActivities.map((activity) => <li key={activity.id}><button type="button" onClick={() => setSelectedActivity(activity)} className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[var(--primary-border)] hover:bg-[var(--primary-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"><div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className="rounded-full bg-[var(--primary-subtle)] px-2.5 py-1 text-[var(--primary)]">{activity.shortDate}</span><span className="flex items-center gap-1 text-slate-500"><BsClock /> {activity.start}–{activity.end}</span><span className={`ml-auto rounded-full px-2.5 py-1 ${activity.required ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-600"}`}>{activity.required ? "Obligatoria" : "Opcional"}</span></div><h3 className="mt-3 text-lg font-black">{activity.title}</h3><p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">{activity.description}</p></button></li>)}</ul>}
      {externalActivities.length > 0 && <details className="group mt-6 border-t border-slate-200 pt-5"><summary className="cursor-pointer list-none text-sm font-bold text-[var(--primary)] [&::-webkit-details-marker]:hidden">Actividades fuera del recinto ({externalActivities.length})</summary><ul className="mt-3 grid gap-2">{externalActivities.map((activity) => <li key={activity.id} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{activity.title}</strong><span className="block text-slate-500">{activity.shortDate} · {activity.start} · {activity.location}</span></li>)}</ul></details>}
    </div>
    {selectedActivity && <ScheduleEventDialog event={selectedActivity} onClose={() => setSelectedActivity(null)} canRequestPoints={canRequestPoints} returnHref={`/mapa?zona=${selectedId}`} />}
  </div>;
}
