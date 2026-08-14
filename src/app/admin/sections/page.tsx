import type { Metadata } from "next";
import Link from "next/link";
import { BsCheckCircleFill, BsDashCircleFill } from "react-icons/bs";
import { AdminNavigation } from "@/features/admin/AdminNavigation";
import { listSections, type AppSection } from "@/lib/sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secciones | Administración",
};

type SectionsPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function SectionsPage({ searchParams }: SectionsPageProps) {
  const { saved, error } = await searchParams;
  let sections: AppSection[] = [];
  let storageError = "";
  try {
    sections = await listSections();
  } catch (caughtError) {
    storageError =
      caughtError instanceof Error
        ? caughtError.message
        : "No se pudo conectar con Azure Table Storage.";
  }

  return (
    <main className="min-h-screen px-4 py-7 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col items-stretch gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Gallardo Camp 2026</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Administración</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <Link href="/" className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]">Ir a la página del evento</Link>
            <form action="/admin/logout" method="post">
              <button type="submit" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50">Cerrar sesión</button>
            </form>
          </div>
        </header>

        <AdminNavigation active="sections" />

        <section className="py-7 sm:py-10">
          <div>
            <h2 className="text-2xl font-bold">Secciones de la aplicación</h2>
            <p className="mt-2 max-w-3xl text-slate-600">Controla qué funcionalidades están disponibles. Una sección desactivada desaparece del menú y sus URLs redirigen a la página principal.</p>
          </div>

          {saved === "true" && <p role="status" className="mt-6 rounded-2xl bg-[var(--primary-subtle)] p-4 text-sm font-semibold text-[var(--primary-dark)]">Configuración actualizada correctamente.</p>}
          {error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">No se pudo actualizar la sección.</p>}
          {storageError && (
            <div role="alert" className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
              <p className="font-bold">Azure Table Storage no está disponible</p>
              <p className="mt-1 break-words">{storageError}</p>
            </div>
          )}

          {!storageError && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(15_23_42/0.06)]">
              <table className="block w-full text-left md:table md:border-collapse">
                <caption className="sr-only">Disponibilidad de las secciones</caption>
                <thead className="hidden border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600 md:table-header-group">
                  <tr>
                    <th scope="col" className="px-5 py-4">Sección</th>
                    <th scope="col" className="hidden px-5 py-4 md:table-cell">Rutas</th>
                    <th scope="col" className="px-5 py-4">Estado</th>
                    <th scope="col" className="px-5 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="block divide-y divide-slate-200 md:table-row-group">
                  {sections.map((section) => (
                    <tr key={section.id} className="block p-5 odd:bg-white even:bg-slate-50/40 md:table-row md:p-0">
                      <td className="block p-0 md:table-cell md:px-5 md:py-5">
                        <span className="block font-bold text-slate-900">{section.name}</span>
                        <span className="mt-1 block max-w-xl text-sm text-slate-500">{section.description}</span>
                      </td>
                      <td className="hidden px-5 py-5 md:table-cell">
                        <div className="flex flex-wrap gap-2">
                          {section.paths.map((path) => <code key={path} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{path}</code>)}
                        </div>
                      </td>
                      <td className="block px-0 pb-3 pt-4 md:table-cell md:px-5 md:py-5">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${section.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {section.enabled ? <BsCheckCircleFill aria-hidden="true" /> : <BsDashCircleFill aria-hidden="true" />}
                          {section.enabled ? "Disponible" : "No disponible"}
                        </span>
                      </td>
                      <td className="block p-0 text-left md:table-cell md:px-5 md:py-5 md:text-right">
                        <form action={`/admin/sections/${section.id}`} method="post">
                          <input type="hidden" name="enabled" value={section.enabled ? "false" : "true"} />
                          <button type="submit" className={`w-full rounded-lg border px-4 py-2.5 text-sm font-bold transition md:w-auto ${section.enabled ? "border-slate-300 text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700" : "border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"}`}>
                            {section.enabled ? "Deshabilitar" : "Habilitar"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
