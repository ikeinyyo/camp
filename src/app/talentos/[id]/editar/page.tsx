import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ContestSubmissionForm } from "@/features/contests/ContestSubmissionForm";
import { getTalent, getTalentContestState } from "@/lib/talents";
import { getUserById } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export default async function EditPublicTalentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const session = readUserSessionToken((await cookies()).get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");

  const [state, activeUser, talent] = await Promise.all([
    getTalentContestState(),
    getUserById(session.activeUserId),
    getTalent(id),
  ]);
  if (state !== "catalog") redirect("/talentos");
  if (!activeUser) redirect("/login");
  if (!talent) notFound();
  if (!talent.participantIds.includes(activeUser.id)) redirect("/talentos");

  return <main className="min-h-screen px-3 py-6 sm:px-6 sm:py-12"><section className="mx-auto max-w-3xl"><Link href="/talentos" className="text-sm font-bold text-[var(--primary)]">← Volver al concurso</Link><p className="mt-6 text-sm font-bold uppercase tracking-[.2em] text-[var(--accent)]">Concurso de talentos</p><h1 className="mt-2 text-3xl font-black">Editar mi actuación</h1><p className="mb-6 mt-2 text-slate-600">Actualiza el nombre, la descripción o la fotografía de vuestra actuación.</p>{query.error && <p className="mb-5 rounded-2xl bg-red-50 p-4 font-bold text-red-700">No se han podido guardar los cambios. Revisa los datos.</p>}<ContestSubmissionForm action={`/talentos/${id}/actualizar`} backHref="/talentos" activeUser={activeUser} users={[]} kind="actuación" item={talent} /></section></main>;
}
