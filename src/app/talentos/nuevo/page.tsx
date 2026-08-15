import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ContestSubmissionForm } from "@/features/contests/ContestSubmissionForm";
import { getTalentContestState } from "@/lib/talents";
import { getUserById, listUsers } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export default async function NewPublicTalentPage() {
  const session = readUserSessionToken((await cookies()).get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");
  const [state, activeUser, users] = await Promise.all([getTalentContestState(), getUserById(session.activeUserId), listUsers()]);
  if (state !== "catalog") redirect("/talentos");
  if (!activeUser) redirect("/login");
  return <main className="min-h-screen px-3 py-6 sm:px-6 sm:py-12"><section className="mx-auto max-w-3xl"><Link href="/talentos" className="text-sm font-bold text-[var(--primary)]">← Volver al concurso</Link><p className="mt-6 text-sm font-bold uppercase tracking-[.2em] text-[var(--accent)]">Concurso de talentos</p><h1 className="mt-2 text-3xl font-black">Añadir mi actuación</h1><p className="mb-6 mt-2 text-slate-600">Presenta vuestro talento y añade a todos sus participantes.</p><ContestSubmissionForm action="/talentos/crear" backHref="/talentos" activeUser={activeUser} users={users} kind="actuación" /></section></main>;
}
