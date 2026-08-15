import type { Metadata } from "next";
import Link from "next/link";
import { BsChevronDown, BsHouse } from "react-icons/bs";
import { AdminNavigation } from "@/features/admin/AdminNavigation";
import { VoucherScanner } from "@/features/admin/VoucherScanner";
import { listActivities } from "@/lib/activities";
import { listUsers } from "@/lib/users";
import { listVouchers } from "@/lib/vouchers";

export const metadata: Metadata = { title: "Validación | Administración" };
export const dynamic = "force-dynamic";

export default async function ValidationPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ saved, error }, users, vouchers, activities] = await Promise.all([searchParams, listUsers(), listVouchers({ includeInactive: true }), listActivities({ includeInactive: true })]);
  const input = "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-[var(--accent)]";
  return <main className="min-h-screen px-3 py-4 sm:px-6 sm:py-12"><div className="mx-auto max-w-7xl">
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4 sm:pb-6"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)] sm:text-sm">Administración</p><h1 className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl">Validar puntos</h1></div><Link href="/" aria-label="Ir al evento" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-xl text-[var(--primary)] sm:flex sm:w-auto sm:gap-2 sm:border-0 sm:bg-[var(--accent)] sm:px-4 sm:text-sm sm:font-bold sm:text-white"><BsHouse /><span className="hidden sm:inline">Ir al evento</span></Link></header>
    <AdminNavigation active="validation" />
    <section className="grid gap-4 py-4 sm:gap-8 sm:py-10">
      {saved && <p role="status" className="rounded-xl bg-emerald-50 p-4 font-bold text-emerald-700">Puntos aplicados correctamente.</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 font-bold text-red-700">{error === "duplicate" ? "Este participante ya recibió los puntos de participación de esa actividad." : "No se pudieron aplicar los puntos seleccionados."}</p>}
      <VoucherScanner />
      <section className="grid gap-3 sm:grid-cols-2">
        <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 font-black [&::-webkit-details-marker]:hidden sm:px-5"><span>Asignar vale manualmente</span><BsChevronDown className="shrink-0 transition group-open:rotate-180" /></summary><form action="/admin/vouchers/manual" method="post" className="grid gap-4 border-t border-slate-100 p-4 sm:p-5"><label className="grid gap-2 text-sm font-bold">Participante<select name="userId" required className={input}><option value="">Seleccionar…</option>{users.map((user) => <option key={user.id} value={user.id}>{user.displayName}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Vale<select name="voucherId" required className={input}><option value="">Seleccionar…</option>{vouchers.filter((voucher) => voucher.active).map((voucher) => <option key={voucher.id} value={voucher.id}>{voucher.title} (+{voucher.points})</option>)}</select></label><button className="min-h-12 rounded-xl bg-[var(--accent)] px-5 font-bold text-white">Aplicar vale</button></form></details>
        <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 font-black [&::-webkit-details-marker]:hidden sm:px-5"><span>Asignar actividad manualmente</span><BsChevronDown className="shrink-0 transition group-open:rotate-180" /></summary><form action="/admin/activities/award" method="post" className="grid gap-4 border-t border-slate-100 p-4 sm:p-5"><label className="grid gap-2 text-sm font-bold">Participante<select name="userId" required className={input}><option value="">Seleccionar…</option>{users.map((user) => <option key={user.id} value={user.id}>{user.displayName}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Actividad<select name="activityId" required className={input}><option value="">Seleccionar…</option>{activities.filter((activity) => activity.active).map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Recompensa<select name="reward" className={input}><option value="participation">Participación</option><option value="first">Primer puesto</option><option value="second">Segundo puesto</option><option value="third">Tercer puesto</option></select></label><button className="min-h-12 rounded-xl bg-[var(--accent)] px-5 font-bold text-white">Aplicar actividad</button></form></details>
      </section>
    </section>
  </div></main>;
}
