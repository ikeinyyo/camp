/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
  BsAwardFill,
  BsChevronDown,
  BsHourglassSplit,
  BsPeopleFill,
  BsStarFill,
  BsTrophyFill,
  BsX,
} from "react-icons/bs";
import type { ContestState, Tapa } from "@/lib/tapas";

type RankedTapa = Tapa & {
  score?: number;
  rank?: number;
  fiveVotes?: number;
  threeVotes?: number;
  oneVotes?: number;
};

export function TapasContest({
  tapas,
  state,
  loggedIn,
  hasVoted,
  voteAction = "/tapas/vote",
  itemLabel = "tapa",
}: {
  tapas: RankedTapa[];
  state: ContestState;
  loggedIn: boolean;
  hasVoted: boolean;
  voteAction?: string;
  itemLabel?: string;
}) {
  const [selected, setSelected] = useState<RankedTapa | null>(null);
  const input =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--accent)]";

  useEffect(() => {
    if (!selected) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  if (tapas.length === 0) {
    return (
      <section className="mx-auto grid min-h-[360px] max-w-2xl place-items-center rounded-3xl border-2 border-dashed border-[var(--primary)]/25 bg-[var(--primary-subtle)] px-6 py-12 text-center">
        <div>
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white text-4xl text-[var(--accent)] shadow-sm">
            <BsHourglassSplit />
          </span>
          <h2 className="mt-6 text-2xl font-black text-[var(--primary-dark)]">
            Aún no hay {itemLabel === "tapa" ? "tapas" : "actuaciones"}
          </h2>
          <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
            Estamos preparando el concurso. Esperad un poquito: las propuestas aparecerán aquí cuando empiece.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {state === "ranking" && (
        <div className="mb-8 rounded-3xl bg-[var(--primary-dark)] p-6 text-center text-white">
          <BsAwardFill className="mx-auto text-4xl text-amber-400" />
          <h2 className="mt-3 text-2xl font-black">Clasificación final</h2>
          <p className="mt-1 text-emerald-100">Resultado de la votación familiar</p>
        </div>
      )}

      {state === "voting" && (
        <section className="mb-8 rounded-3xl border border-orange-200 bg-orange-50 p-5 sm:p-7">
          <h2 className="text-2xl font-black text-orange-950">La votación está abierta</h2>
          <p className="mt-2 text-sm text-orange-900">
            Elige tres {itemLabel === "tapa" ? "tapas distintas" : "actuaciones distintas"}: tu favorita recibe 5 puntos, la siguiente 3 y la tercera 1.
          </p>
          {!loggedIn ? (
            <a href="/login" className="mt-5 block rounded-xl bg-[var(--accent)] px-5 py-3 text-center font-bold text-white">
              Iniciar sesión para votar
            </a>
          ) : hasVoted ? (
            <p className="mt-5 rounded-xl bg-white p-4 text-center font-bold text-emerald-700">
              Tu voto ya está registrado. ¡Gracias!
            </p>
          ) : (
            <form action={voteAction} method="post" className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ["firstId", "🥇 5 puntos"],
                ["secondId", "🥈 3 puntos"],
                ["thirdId", "🥉 1 punto"],
              ].map(([name, label]) => (
                <label key={name} className="grid gap-2 text-sm font-bold">
                  {label}
                  <select name={name} required className={input}>
                    <option value="">Elige {itemLabel === "tapa" ? "una tapa" : "una actuación"}…</option>
                    {tapas.map((tapa) => (
                      <option key={tapa.id} value={tapa.id}>{tapa.name}</option>
                    ))}
                  </select>
                </label>
              ))}
              <button className="rounded-xl bg-[var(--accent)] px-5 py-3 font-black text-white md:col-span-3">
                Enviar mi voto
              </button>
            </form>
          )}
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {tapas.map((tapa) => (
          <button
            key={tapa.id}
            type="button"
            onClick={() => setSelected(tapa)}
            className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition active:scale-[0.98] sm:rounded-3xl sm:hover:-translate-y-1 sm:hover:shadow-lg"
          >
            <div className="relative">
              <img src={tapa.imageUrl} alt={tapa.name} className="aspect-square w-full object-cover" />
              {state === "ranking" && (
                <span className="absolute left-2 top-2 grid h-9 min-w-9 place-items-center rounded-full bg-white px-2 text-sm font-black shadow-lg sm:left-3 sm:top-3 sm:h-11 sm:min-w-11 sm:text-lg">
                  {tapa.rank}.º
                </span>
              )}
            </div>
            <div className="p-3 sm:p-5">
              <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
                <h2 className="line-clamp-2 text-base font-black leading-tight sm:text-xl">{tapa.name}</h2>
                {state === "ranking" && (
                  <span className="shrink-0 rounded-full bg-[var(--accent-subtle)] px-2 py-1 text-xs font-black text-[var(--accent)] sm:px-3 sm:text-base">
                    {tapa.score}
                  </span>
                )}
              </div>
              <p className="mt-2 hidden line-clamp-2 text-sm leading-6 text-slate-600 sm:block">
                {tapa.description}
              </p>
              <p className="mt-3 flex min-w-0 items-center gap-1.5 text-xs font-bold text-[var(--primary)] sm:mt-4 sm:gap-2 sm:text-sm">
                <BsPeopleFill className="shrink-0" />
                <span className="truncate">{tapa.participantNames.join(", ")}</span>
              </p>
              {state === "ranking" && (
                <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-3 text-center sm:mt-4 sm:gap-2 sm:pt-4">
                  {[
                    [tapa.fiveVotes, "5", "text-amber-600"],
                    [tapa.threeVotes, "3", "text-slate-500"],
                    [tapa.oneVotes, "1", "text-orange-700"],
                  ].map(([count, points, color]) => (
                    <span key={String(points)} className="rounded-lg bg-slate-50 px-1 py-1.5 sm:rounded-xl sm:py-2">
                      <strong className={`block text-sm sm:text-lg ${color}`}>{count}</strong>
                      <span className="block text-[9px] font-bold uppercase text-slate-500 sm:text-[11px]">votos de {points}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-slate-950/75 sm:place-items-center sm:p-4 sm:backdrop-blur-sm"
          onClick={(event) => event.target === event.currentTarget && setSelected(null)}
        >
          <article
            role="dialog"
            aria-modal="true"
            aria-labelledby="tapa-detail-title"
            className="relative max-h-[94dvh] w-full max-w-xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <button type="button" onClick={() => setSelected(null)} aria-label="Cerrar detalle" className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/70 text-2xl text-white shadow-lg backdrop-blur">
              <BsX />
            </button>

            <div className="max-h-[94dvh] overflow-y-auto overscroll-contain">
              <div className="relative">
                <img src={selected.imageUrl} alt={selected.name} className="h-[42dvh] min-h-64 w-full object-cover sm:aspect-square sm:h-auto" />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
                {state === "ranking" && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white">
                    <span className="grid h-12 min-w-12 place-items-center rounded-full bg-white px-2 text-lg font-black text-[var(--primary-dark)] shadow-lg">
                      {selected.rank}.º
                    </span>
                    <span><strong className="block text-2xl">{selected.score} puntos</strong><span className="text-xs text-white/80">Clasificación final</span></span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 border-b border-slate-100 bg-white py-2 text-xs font-bold text-[var(--accent)] sm:hidden">
                <BsChevronDown className="animate-bounce" /> Desliza para ver todos los detalles
              </div>

              <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">{itemLabel === "tapa" ? "Propuesta" : "Actuación"} del concurso</p>
              <h2 id="tapa-detail-title" className="mt-2 text-3xl font-black leading-tight">{selected.name}</h2>

              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[var(--primary-subtle)] p-4">
                <BsPeopleFill className="mt-0.5 shrink-0 text-xl text-[var(--primary)]" />
                <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Responsables</p><p className="mt-1 font-bold text-[var(--primary-dark)]">{selected.participantNames.join(", ")}</p></div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Descripción</h3>
                <p className="mt-2 whitespace-pre-line text-base leading-7 text-slate-700">{selected.description}</p>
              </div>

              {state === "ranking" && (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h3 className="flex items-center gap-2 font-black"><BsTrophyFill className="text-amber-500" /> Desglose de la votación</h3>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      [selected.fiveVotes, "votos de 5", "text-amber-600"],
                      [selected.threeVotes, "votos de 3", "text-slate-500"],
                      [selected.oneVotes, "votos de 1", "text-orange-700"],
                    ].map(([count, label, color]) => (
                      <div key={String(label)} className="rounded-2xl bg-slate-50 p-3">
                        <BsStarFill className={`mx-auto ${color}`} />
                        <strong className="mt-1 block text-2xl">{count}</strong>
                        <span className="text-[11px] font-semibold text-slate-500">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
