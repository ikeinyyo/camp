import Link from "next/link";
import { TapaForm } from "@/features/admin/TapaForm";
import { listUsers } from "@/lib/users";
export const dynamic = "force-dynamic";
export default async function NewTapaPage() { const users = await listUsers(); return <main className="min-h-screen px-3 py-4 sm:px-4 sm:py-8"><section className="mx-auto max-w-3xl"><header className="mb-4 flex items-center gap-3 sm:mb-6"><Link href="/admin/tapas" aria-label="Volver a tapas" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-xl text-[var(--primary)]">←</Link><div><p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Concurso de tapas</p><h1 className="text-2xl font-black sm:text-3xl">Crear tapa</h1></div></header><TapaForm action="/admin/tapas/create" users={users} /></section></main>; }
