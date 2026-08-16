"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BsGeoAltFill,
  BsPeopleFill,
  BsStarFill,
  BsTrophyFill,
} from "react-icons/bs";
import { getMapZone } from "@/config/locations";
import type { ScheduleDay, ScheduleEvent } from "@/config/schedule";

const START_HOUR = 9;
const END_HOUR = 25;
const HOUR_HEIGHT = 76;

function timeToHour(time: string) {
  const [rawHour, minutes] = time.split(":").map(Number);
  const hour = rawHour < START_HOUR ? rawHour + 24 : rawHour;
  return hour + minutes / 60;
}

function eventPosition(event: ScheduleEvent, startHour: number) {
  const start = timeToHour(event.start);
  let end = timeToHour(event.end);
  if (end <= start) end += 24;

  return {
    top: (start - startHour) * HOUR_HEIGHT,
    height: Math.max((end - start) * HOUR_HEIGHT, 48),
  };
}

function displayHour(hour: number) {
  return `${String(hour % 24).padStart(2, "0")}:00`;
}

function mobileStartHour(day: ScheduleDay) {
  if (day.events.length === 0) return START_HOUR;
  const firstEventHour = Math.min(...day.events.map((event) => timeToHour(event.start)));
  return Math.max(0, Math.floor(firstEventHour) - 1);
}

function duration(event: ScheduleEvent) {
  let minutes = (timeToHour(event.end) - timeToHour(event.start)) * 60;
  if (minutes <= 0) minutes += 24 * 60;
  const hoursPart = Math.floor(minutes / 60);
  const minutesPart = minutes % 60;

  return [
    hoursPart ? `${hoursPart} h` : "",
    minutesPart ? `${minutesPart} min` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function DayTimeline({
  day,
  onSelectEvent,
  startHour = START_HOUR,
}: {
  day: ScheduleDay;
  onSelectEvent: (event: ScheduleEvent) => void;
  startHour?: number;
}) {
  const hours = Array.from(
    { length: END_HOUR - startHour + 1 },
    (_, index) => startHour + index,
  );

  return (
    <section aria-label={day.date} className="min-w-0">
      <h3 className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-3 py-3 text-center text-base font-bold backdrop-blur">
        {day.date}
      </h3>
      <div className="grid grid-cols-[3.5rem_1fr]">
        <div aria-hidden="true" className="relative text-xs text-slate-500">
          {hours.map((hour) => (
            <span
              key={hour}
              className="absolute right-2 -translate-y-1/2 tabular-nums"
              style={{ top: (hour - startHour) * HOUR_HEIGHT }}
            >
              {displayHour(hour)}
            </span>
          ))}
        </div>
        <div
          className="relative border-l border-slate-200"
          style={{
            height: (END_HOUR - startHour) * HOUR_HEIGHT,
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 75px, rgb(226 232 240) 75px, rgb(226 232 240) 76px)",
          }}
        >
          {day.events.map((event, index) => {
            const position = eventPosition(event, startHour);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="absolute left-2 right-2 overflow-hidden rounded-xl border border-[var(--primary-border)] bg-[var(--primary-soft)] px-3 py-2 text-left shadow-sm transition hover:z-10 hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)] focus:z-10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={{
                  top: position.top + 2,
                  height: position.height - 4,
                  backgroundColor: index % 2 === 0 ? "#d1fae5" : "#dcfce7",
                }}
                aria-label={`${event.title}, de ${event.start} a ${event.end}`}
              >
                <span className="flex items-center justify-between gap-2 text-xs font-semibold tabular-nums text-[var(--accent-hover)]">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <BsPeopleFill
                      aria-label={
                        event.required
                          ? "Obligatoria"
                          : "Opcional"
                      }
                      title={
                        event.required
                          ? "Obligatoria"
                          : "Opcional"
                      }
                      className={`shrink-0 ${
                        event.required
                          ? "text-[var(--accent)]"
                          : "text-[var(--primary)]"
                      }`}
                    />
                    <span>{event.start}–{event.end}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {event.participationPoints > 0 && (
                      <BsStarFill aria-label="Otorga puntos" title="Otorga puntos" />
                    )}
                    {event.podiumPoints && (
                      <BsTrophyFill
                        aria-label="Otorga puntos por posición"
                        title="Otorga puntos por posición"
                      />
                    )}
                  </span>
                </span>
                <span className="mt-0.5 block font-bold leading-tight text-slate-900">
                  {event.title}
                </span>
                {position.height >= 90 && (
                  <span className="mt-1 line-clamp-2 block text-xs leading-4 text-slate-600">
                    {event.location}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ScheduleEventDialog({
  event,
  onClose,
  canRequestPoints,
  returnHref = "/agenda",
}: {
  event: ScheduleEvent;
  onClose: () => void;
  canRequestPoints: boolean;
  returnHref?: string;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mapZone = getMapZone(event.location);
  const externalMapUrl = event.location === "El Mirador"
    ? "https://maps.app.goo.gl/b48rKWraVdVx2rBG9"
    : undefined;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`event-title-${event.id}`}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm"
    >
      <article
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold tabular-nums text-[var(--accent)]">
              {event.start}–{event.end} · {duration(event)}
            </p>
            <h2
              id={`event-title-${event.id}`}
              className="mt-2 text-2xl font-bold tracking-tight"
            >
              {event.title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xl transition hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          {mapZone ? <Link href={`/mapa?zona=${encodeURIComponent(mapZone.id)}`} onClick={onClose} className="flex items-start gap-3 rounded-2xl bg-[var(--primary-subtle)] p-4 transition hover:bg-[var(--primary-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]" aria-label={`Ver ${event.location} en el mapa`}>
            <BsGeoAltFill
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-xl text-[var(--primary)]"
            />
            <div>
              <dt className="sr-only">Lugar</dt>
              <dd className="text-base font-semibold underline decoration-[var(--primary-border)] underline-offset-4">{event.location}</dd>
            </div>
          </Link> : externalMapUrl ? <a href={externalMapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl bg-[var(--primary-subtle)] p-4 transition hover:bg-[var(--primary-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]" aria-label={`Abrir ${event.location} en Google Maps`}>
            <BsGeoAltFill aria-hidden="true" className="mt-0.5 shrink-0 text-xl text-[var(--primary)]" />
            <div><dt className="sr-only">Lugar</dt><dd className="text-base font-semibold underline decoration-[var(--primary-border)] underline-offset-4">{event.location}</dd></div>
          </a> : <div className="flex items-start gap-3 rounded-2xl bg-[var(--primary-subtle)] p-4">
            <BsGeoAltFill aria-hidden="true" className="mt-0.5 shrink-0 text-xl text-[var(--primary)]" />
            <div><dt className="sr-only">Lugar</dt><dd className="text-base font-semibold">{event.location}</dd></div>
          </div>}
          <div className="flex items-start gap-3 rounded-2xl bg-[var(--accent-subtle)] p-4">
            <BsPeopleFill
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-xl text-[var(--accent)]"
            />
            <div>
              <dt className="sr-only">Asistencia</dt>
              <dd className="text-base font-semibold">
                {event.required ? "Obligatoria" : "Opcional"}
              </dd>
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-3 rounded-2xl bg-[var(--primary-subtle)] p-4 sm:col-span-2">
            <BsStarFill
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-xl text-[var(--accent)]"
            />
            <dt className="sr-only">Puntos</dt>
            <dd className="text-base font-semibold">
              {event.participationPoints > 0
                ? `${event.participationPoints} puntos por participar`
                : "No otorga puntos"}
            </dd>
            {event.podiumPoints && (
              <>
                <BsTrophyFill
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-xl text-[var(--accent)]"
                />
                <dd className="text-base font-semibold">
                  Premios: {event.podiumPoints.first} puntos al primer puesto,{" "}
                  {event.podiumPoints.second} al segundo y {event.podiumPoints.third} al tercero
                </dd>
              </>
            )}
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-slate-500">Descripción</dt>
            <dd className="mt-1 text-base leading-7">{event.description}</dd>
          </div>
        </dl>
        {canRequestPoints && event.participationPoints > 0 && (
          <a href={`/actividades/${event.id}/vale?volver=${encodeURIComponent(returnHref)}`} className="mt-6 block rounded-xl bg-[var(--primary)] px-5 py-3 text-center font-bold text-white hover:bg-[var(--primary-dark)]">
            Generar QR de participación
          </a>
        )}
      </article>
    </div>
  );
}

export function Schedule({ schedule, canRequestPoints = false }: { schedule: ScheduleDay[]; canRequestPoints?: boolean }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  const changeDay = (direction: -1 | 1) => {
    setSelectedDay((current) =>
      Math.min(Math.max(current + direction, 0), schedule.length - 1),
    );
  };

  return (
    <section aria-labelledby="schedule-title" className="mx-auto w-full max-w-6xl">
      <div className="mb-6 px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          28, 29 y 30 de agosto
        </p>
        <h2 id="schedule-title" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Agenda del fin de semana
        </h2>
        <p className="mt-2 text-slate-600">Pulsa en una actividad para ver todos los detalles.</p>
      </div>

      <div className="lg:hidden">
        <nav aria-label="Cambiar día" className="mb-3 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            disabled={selectedDay === 0}
            aria-label="Día anterior"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--accent-border)] bg-white text-2xl text-[var(--accent-hover)] transition hover:bg-[var(--accent-subtle)] disabled:opacity-30"
          >
            ‹
          </button>
          <span className="font-bold">{schedule[selectedDay].shortDate}</span>
          <button
            type="button"
            onClick={() => changeDay(1)}
            disabled={selectedDay === schedule.length - 1}
            aria-label="Día siguiente"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--accent-border)] bg-white text-2xl text-[var(--accent-hover)] transition hover:bg-[var(--accent-subtle)] disabled:opacity-30"
          >
            ›
          </button>
        </nav>
        <div className="overflow-hidden border-y border-slate-200 bg-white">
          <DayTimeline
            day={schedule[selectedDay]}
            onSelectEvent={setSelectedEvent}
            startHour={mobileStartHour(schedule[selectedDay])}
          />
        </div>
      </div>

      <div className="mx-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-3 lg:divide-x lg:divide-slate-200">
        {schedule.map((day) => (
          <DayTimeline key={day.id} day={day} onSelectEvent={setSelectedEvent} />
        ))}
      </div>

      {selectedEvent && (
        <ScheduleEventDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} canRequestPoints={canRequestPoints} />
      )}
    </section>
  );
}
