import Link from "next/link";
import { TapaForm } from "@/features/admin/TapaForm";
import { listUsers } from "@/lib/users";
export const dynamic = "force-dynamic";
export default async function NewTapaPage() { const users = await listUsers(); return <main className="min-h-screen px-4 py-8"><section className="mx-auto max-w-3xl"><Link href="/admin/tapas" className="text-sm font-bold text-[var(--primary)]">← Volver</Link><h1 className="my-6 text-3xl font-black">Crear tapa</h1><TapaForm action="/admin/tapas/create" users={users} /></section></main>; }
