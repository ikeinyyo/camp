import type { Metadata } from "next";
import Link from "next/link";
import { AdminNavigation } from "@/features/admin/AdminNavigation";
import { getRankingConfig } from "@/lib/ranking-mode";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ranking | Administración" };

export default async function AdminRankingPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ saved, error }, config] = await Promise.all([searchParams, getRankingConfig()]);
  const { mode, showPrizes } = config;
  return <main className="min-h-screen px-4 py-7 sm:px-6 sm:py-12"><div className="mx-auto max-w-7xl">
    <header className="flex flex-col items-stretch gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--accent)]">Gallardo Camp 2026</p><h1 className="mt-2 text-3xl font-bold">Administración</h1></div><Link href="/ranking" className="rounded-xl bg-[var(--accent)] px-4 py-2 text-center text-sm font-bold text-white">Ver ranking</Link></header>
    <AdminNavigation active="ranking" />
    <section className="py-8"><h2 className="text-2xl font-black">Modo del ranking</h2><p className="mt-2 max-w-2xl text-slate-600">El modo normal muestra la clasificación actual, el oculto mantiene en secreto el orden del top 5 y Final Score presenta los resultados definitivos.</p>
      {saved && <p className="mt-6 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-700">Configuración actualizada correctamente.</p>}{error && <p className="mt-6 rounded-2xl bg-red-50 p-4 font-bold text-red-700">No se pudo actualizar la configuración.</p>}
      <form action="/admin/ranking/mode" method="post" className="mt-7 grid gap-4 md:grid-cols-3">
        <button name="mode" value="live" className={`rounded-3xl border-2 p-6 text-left transition ${mode === "live" ? "border-[var(--primary)] bg-[var(--primary-subtle)]" : "border-slate-200 bg-white"}`}><strong className="block text-xl">Ranking normal</strong><span className="mt-2 block text-sm leading-6 text-slate-600">Clasificación general actualizada con todos los participantes.</span>{mode === "live" && <span className="mt-4 inline-block rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white">Activo</span>}</button>
        <button name="mode" value="hidden" className={`rounded-3xl border-2 p-6 text-left transition ${mode === "hidden" ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-white"}`}><strong className="block text-xl">Ranking oculto</strong><span className="mt-2 block text-sm leading-6 text-slate-600">Muestra el top 5 sin orden ni puntos y conserva la clasificación desde el sexto puesto.</span>{mode === "hidden" && <span className="mt-4 inline-block rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">Activo</span>}</button>
        <button name="mode" value="final" className={`rounded-3xl border-2 p-6 text-left transition ${mode === "final" ? "border-[var(--accent)] bg-[var(--accent-subtle)]" : "border-slate-200 bg-white"}`}><strong className="block text-xl">Final Score</strong><span className="mt-2 block text-sm leading-6 text-slate-600">Carrusel final con podio, ranking completo, agradecimiento y cuenta atrás para 2027.</span>{mode === "final" && <span className="mt-4 inline-block rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white">Activo</span>}</button>
      </form>
    </section>
    <section className="border-t border-slate-200 py-8"><h2 className="text-2xl font-black">Imagen de los premios</h2><p className="mt-2 max-w-2xl text-slate-600">Controla si la imagen <code>premios.png</code> aparece antes de la clasificación.</p><form action="/admin/ranking/prizes" method="post" className={`mt-6 flex flex-col gap-4 rounded-3xl border-2 p-6 sm:flex-row sm:items-center sm:justify-between ${showPrizes ? "border-[var(--primary)] bg-[var(--primary-subtle)]" : "border-slate-200 bg-white"}`}><div><strong className="text-lg">{showPrizes ? "Premios visibles" : "Premios ocultos"}</strong><span className="mt-1 block text-sm text-slate-600">{showPrizes ? "Los participantes ven la imagen antes del ranking." : "La clasificación se muestra sin la imagen de premios."}</span></div><button name="visible" value={showPrizes ? "false" : "true"} className={`shrink-0 rounded-xl px-5 py-3 font-black ${showPrizes ? "border border-slate-300 bg-white text-slate-700" : "bg-[var(--primary)] text-white"}`}>{showPrizes ? "Ocultar premios" : "Mostrar premios"}</button></form></section>
  </div></main>;
}
