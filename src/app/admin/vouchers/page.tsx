import type { Metadata } from "next";
import Link from "next/link";
import { AdminNavigation } from "@/features/admin/AdminNavigation";
import { AdminVoucherLists } from "@/features/admin/AdminVoucherLists";
import { VOUCHER_CATEGORIES } from "@/config/vouchers";
import { getVoucherState, listVoucherProposals, listVouchers } from "@/lib/vouchers";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vales | Administración" };

type Props = { searchParams: Promise<{ saved?: string; error?: string }> };

export default async function AdminVouchersPage({ searchParams }: Props) {
  const { saved, error } = await searchParams;
  const [vouchers, proposals, state, users] = await Promise.all([
    listVouchers({ includeInactive: true }),
    listVoucherProposals(),
    getVoucherState(),
    listUsers(),
  ]);
  const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]";

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col items-stretch gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:pb-6">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Gallardo Camp 2026</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Administración</h1></div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3"><Link href="/" className="rounded-xl bg-[var(--accent)] px-4 py-2 text-center text-sm font-semibold text-white">Ir al evento</Link><form action="/admin/logout" method="post"><button className="h-full w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">Cerrar sesión</button></form></div>
        </header>
        <AdminNavigation active="vouchers" />

        <div className="grid min-w-0 gap-8 py-10">
          {saved && <p role="status" className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">Operación realizada correctamente.</p>}
          {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">No se pudo realizar la operación.</p>}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Estado de los vales</h2>
            <p className="mt-1 text-sm text-slate-600">Controla si los participantes pueden proponer ideas o consultar el catálogo definitivo.</p>
            <form action="/admin/vouchers/state" method="post" className="mt-5 grid gap-2 sm:grid-cols-2">
              <button name="state" value="proposals" className={`min-h-12 rounded-xl px-4 font-bold ${state === "proposals" ? "bg-[var(--accent)] text-white" : "bg-slate-100 text-slate-900"}`}>Propuestas abiertas</button>
              <button name="state" value="normal" className={`min-h-12 rounded-xl px-4 font-bold ${state === "normal" ? "bg-[var(--primary)] text-white" : "bg-slate-100 text-slate-900"}`}>Catálogo normal</button>
            </form>
          </section>

          <section className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div><h2 className="text-2xl font-black">Propuestas recibidas</h2><p className="mt-1 text-sm text-slate-600">Cuando hayas convertido o descartado una idea, elimínala de esta lista.</p></div>
              <span className="rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-sm font-black text-[var(--accent-hover)]">{proposals.length} {proposals.length === 1 ? "propuesta" : "propuestas"}</span>
            </div>
            {proposals.length === 0 ? (
              <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Todavía no hay propuestas de vales.</div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {proposals.map((proposal) => <article key={proposal.id} className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="whitespace-pre-line leading-7 text-slate-800">{proposal.text}</p><div className="mt-auto pt-5"><p className="text-sm font-bold text-[var(--primary-dark)]">{proposal.displayName} <span className="font-normal text-slate-500">@{proposal.username}</span></p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" }).format(new Date(proposal.createdAt))}</p><form action={`/admin/vouchers/proposals/${proposal.id}/delete`} method="post" className="mt-4"><button className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50">Eliminar propuesta</button></form></div></article>)}
              </div>
            )}
          </section>
          <section className="min-w-0 rounded-2xl border border-[var(--primary-border)] bg-[var(--primary-subtle)] p-5">
            <h2 className="text-xl font-black">Crear un vale</h2>
            <form action="/admin/vouchers/create" method="post" className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.5fr_160px_100px_120px_auto] lg:items-end">
              <input type="hidden" name="sortOrder" value={1000} />
              <label className="grid gap-2 text-sm font-bold">Título<input name="title" required minLength={3} maxLength={80} className={inputClass} /></label>
              <label className="grid gap-2 text-sm font-bold">Descripción<input name="description" required minLength={5} maxLength={500} className={inputClass} /></label>
              <label className="grid gap-2 text-sm font-bold">Categoría<select name="category" required className={inputClass}>{VOUCHER_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className="grid gap-2 text-sm font-bold">Puntos<input name="points" type="number" min={1} max={5} defaultValue={5} required className={inputClass} /></label>
              <label className="grid gap-2 text-sm font-bold">Máx. plazas<input name="maxReservations" type="number" min={1} placeholder="Ilimitadas" className={inputClass} /></label>
              <button type="submit" className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white">+ Crear vale</button>
            </form>
          </section>
          <AdminVoucherLists initialVouchers={vouchers} users={users} />
        </div>
      </div>
    </main>
  );
}
