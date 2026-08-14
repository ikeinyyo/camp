import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityForm } from "@/features/admin/ActivityForm";
import { getActivity } from "@/lib/activities";
export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const activity = await getActivity(id); if (!activity) notFound(); return <main className="min-h-screen px-4 py-10"><section className="mx-auto max-w-3xl"><Link href="/admin/activities" className="text-sm font-bold text-[var(--primary)]">← Volver</Link><h1 className="my-6 text-3xl font-black">Editar actividad</h1><ActivityForm action={`/admin/activities/${id}/update`} activity={activity} /></section></main>; }
