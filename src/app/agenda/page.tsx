import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Schedule } from "@/features/schedule/Schedule";
import { isSectionEnabled } from "@/lib/sections";
import { getSchedule } from "@/lib/activities";
import { cookies } from "next/headers";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";
import { getUserById } from "@/lib/users";

export const metadata: Metadata = {
  title: "Agenda | Gallardo Camp 2026",
  description: "Agenda del fin de semana de Gallardo Camp 2026.",
};

export default async function AgendaPage() {
  if (!(await isSectionEnabled("agenda"))) redirect("/");
  const [schedule, cookieStore] = await Promise.all([getSchedule(), cookies()]);
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  const activeUser = session ? await getUserById(session.activeUserId) : null;

  return (
    <main className="min-h-screen py-10 sm:py-14">
      <Schedule schedule={schedule} canRequestPoints={Boolean(activeUser)} activeUserName={activeUser?.displayName} />
    </main>
  );
}
