import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Iniciar sesión | Gallardo Camp 2026" };

type LoginPageProps = { searchParams: Promise<{ error?: string }> };

const errorMessages: Record<string, string> = {
  invalid: "El usuario o la contraseña no son correctos.",
  missing: "Introduce un usuario y una contraseña.",
  config: "El acceso no está configurado todavía. Avísale al administrador.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Participantes</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Iniciar sesión</h1>
          <p className="mt-3 text-slate-600">Accede con uno de los usuarios de la familia en este dispositivo.</p>
        </div>

        {error && errorMessages[error] && (
          <p role="alert" className="mt-8 rounded-2xl bg-red-50 p-4 text-center text-sm font-medium text-red-700">{errorMessages[error]}</p>
        )}

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form action="/login/session" method="post" className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Usuario
              <input name="username" autoComplete="username" required className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Contraseña
              <input name="password" type="password" autoComplete="current-password" required className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />
            </label>
            <button type="submit" className="mt-2 rounded-xl bg-[var(--accent)] px-5 py-3 font-bold text-white transition hover:bg-[var(--accent-hover)]">Entrar</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Todavía no tienes usuario?{" "}
            <Link href="/registro" className="font-bold text-[var(--primary)] hover:underline">Crear usuario</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
