import type { Metadata } from "next";
import Link from "next/link";
import { BsHouse } from "react-icons/bs";
import { AdminNavigation } from "@/features/admin/AdminNavigation";
import { PointsLottery } from "@/features/admin/PointsLottery";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sorteo de puntos | Administración" };

export default async function AdminLotteryPage() {
  const users = (await listUsers()).filter((user) => user.approved);
  return <main className="min-h-screen px-4 py-7 sm:px-6 sm:py-12"><div className="mx-auto max-w-7xl">
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 pb-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)] sm:text-sm">Administración</p><h1 className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl">Sorteo de puntos</h1></div><Link href="/" aria-label="Ir al evento" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-xl text-[var(--primary)] sm:flex sm:w-auto sm:gap-2 sm:border-0 sm:bg-[var(--accent)] sm:px-4 sm:text-sm sm:font-bold sm:text-white"><BsHouse /><span className="hidden sm:inline">Ir al evento</span></Link></header>
    <AdminNavigation active="lottery" />
    <div className="py-6 sm:py-10"><PointsLottery users={users} /></div>
  </div></main>;
}
