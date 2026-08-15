import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ContestSubmissionForm } from "@/features/contests/ContestSubmissionForm";
import { getContestState } from "@/lib/tapas";
import { getUserById, listUsers } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export default async function NewPublicTapaPage() {
  const session = readUserSessionToken((await cookies()).get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");
  const [state, activeUser, users] = await Promise.all([getContestState(), getUserById(session.activeUserId), listUsers()]);
  if (state !== "catalog") redirect("/tapas");
  if (!activeUser) redirect("/login");
  return <main className="min-h-screen px-3 py-6 sm:px-6 sm:py-12"><section className="mx-auto max-w-3xl"><Link href="/tapas" className="text-sm font-bold text-[var(--primary)]">← Volver al concurso</Link><p className="mt-6 text-sm font-bold uppercase tracking-[.2em] text-[var(--accent)]">Concurso de tapas</p><h1 className="mt-2 text-3xl font-black">Añadir mi tapa</h1><p className="mb-6 mt-2 text-slate-600">Presenta vuestra propuesta y añade a todos sus responsables.</p><ContestSubmissionForm action="/tapas/crear" backHref="/tapas" activeUser={activeUser} users={users} kind="tapa" /></section></main>;
}
