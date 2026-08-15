import Link from "next/link";
import { notFound } from "next/navigation";
import { TalentForm } from "@/features/admin/TalentForm";
import { getTalent } from "@/lib/talents";
import { listUsers } from "@/lib/users";
export const dynamic = "force-dynamic";
export default async function EditTalentPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const [talent, users] = await Promise.all([getTalent(id), listUsers()]); if (!talent) notFound(); return <main className="min-h-screen px-3 py-4 sm:px-4 sm:py-8"><section className="mx-auto max-w-3xl"><header className="mb-4 flex items-center gap-3 sm:mb-6"><Link href="/admin/talentos" aria-label="Volver a talentos" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-xl text-[var(--primary)]">←</Link><div><p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Concurso de talentos</p><h1 className="text-2xl font-black sm:text-3xl">Editar actuación</h1></div></header><TalentForm action={`/admin/talentos/${id}/update`} users={users} talent={talent} /></section></main>; }
