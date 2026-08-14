import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Administración | Gallardo Camp 2026",
};

export default function AdminHomePage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Gallardo Camp 2026
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Administración</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
            >
              Ir a la página del evento
            </Link>
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        <section className="py-10">
          <h2 className="text-xl font-semibold">Panel de control</h2>
          <p className="mt-2 text-slate-600">
            Desde aquí gestionaremos la información del evento.
          </p>
        </section>
      </div>
    </main>
  );
}
