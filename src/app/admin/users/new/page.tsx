import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Crear usuario | Administración",
};

type NewUserPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  duplicate: "Ese nombre de usuario ya está en uso.",
  validation: "Revisa los datos introducidos.",
  storage: "No se pudo crear el usuario en Azure Table Storage.",
};

export default async function NewUserPage({ searchParams }: NewUserPageProps) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-2xl">
        <Link href="/admin" className="text-sm font-bold text-[var(--primary)] hover:underline">← Volver a usuarios</Link>
        <header className="mt-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Administración</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Crear usuario</h1>
          <p className="mt-2 text-slate-600">Añade un participante. Comenzará con cero puntos.</p>
        </header>

        {error && errorMessages[error] && (
          <p role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{errorMessages[error]}</p>
        )}

        <form action="/admin/users" method="post" className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(15_23_42/0.06)] sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Usuario
              <input name="username" required minLength={3} maxLength={32} autoComplete="off" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Nombre visible
              <input name="displayName" required minLength={2} maxLength={80} autoComplete="off" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">
              Contraseña
              <input name="password" type="password" required minLength={6} autoComplete="new-password" className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />
              <span className="font-normal text-slate-500">Mínimo 6 caracteres.</span>
            </label>
          </div>
          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
            <Link href="/admin" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Cancelar</Link>
            <button type="submit" className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary-dark)]">Crear usuario</button>
          </div>
        </form>
      </section>
    </main>
  );
}
