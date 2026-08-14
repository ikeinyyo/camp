import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Schedule } from "@/features/schedule/Schedule";
import { isSectionEnabled } from "@/lib/sections";
import { getSchedule } from "@/lib/activities";
import { cookies } from "next/headers";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const metadata: Metadata = {
  title: "Agenda | Gallardo Camp 2026",
  description: "Agenda del fin de semana de Gallardo Camp 2026.",
};

export default async function AgendaPage() {
  if (!(await isSectionEnabled("agenda"))) redirect("/");
  const [schedule, cookieStore] = await Promise.all([getSchedule(), cookies()]);
  const hasSession = Boolean(readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value));

  return (
    <main className="min-h-screen py-10 sm:py-14">
      <Schedule schedule={schedule} canRequestPoints={hasSession} />
    </main>
  );
}
