import Link from "next/link";
import { notFound } from "next/navigation";
import { TapaForm } from "@/features/admin/TapaForm";
import { getTapa } from "@/lib/tapas";
import { listUsers } from "@/lib/users";
export const dynamic = "force-dynamic";
export default async function EditTapaPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const [tapa, users] = await Promise.all([getTapa(id), listUsers()]); if (!tapa) notFound(); return <main className="min-h-screen px-4 py-8"><section className="mx-auto max-w-3xl"><Link href="/admin/tapas" className="text-sm font-bold text-[var(--primary)]">← Volver</Link><h1 className="my-6 text-3xl font-black">Editar tapa</h1><TapaForm action={`/admin/tapas/${id}/update`} users={users} tapa={tapa} /></section></main>; }
