import type { Metadata } from "next";
import { Schedule } from "@/features/schedule/Schedule";

export const metadata: Metadata = {
  title: "Agenda | Gallardo Camp 2026",
  description: "Agenda del fin de semana de Gallardo Camp 2026.",
};

export default function AgendaPage() {
  return (
    <main className="min-h-screen py-10 sm:py-14">
      <Schedule />
    </main>
  );
}
