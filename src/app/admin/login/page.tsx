import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acceso de administración | Gallardo Camp 2026",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Gallardo Camp 2026
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Administración</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Introduce la contraseña de administrador para continuar.
        </p>

        {error === "invalid" && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            La contraseña no es correcta.
          </p>
        )}
        {error === "config" && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            Falta configurar la variable de entorno ADMIN_PASSWORD.
          </p>
        )}

        <form action="/admin/login/session" method="post" className="mt-6">
          <label htmlFor="password" className="block text-sm font-medium text-slate-800">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800"
          >
            Entrar
          </button>
        </form>

        <Link
          href="/"
          className="mt-3 block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Volver a la página principal
        </Link>
      </section>
    </main>
  );
}
