import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Schedule } from "@/features/schedule/Schedule";
import { isSectionEnabled } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Agenda | Gallardo Camp 2026",
  description: "Agenda del fin de semana de Gallardo Camp 2026.",
};

export default async function AgendaPage() {
  if (!(await isSectionEnabled("agenda"))) redirect("/");

  return (
    <main className="min-h-screen py-10 sm:py-14">
      <Schedule />
    </main>
  );
}
