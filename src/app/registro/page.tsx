import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isSectionEnabled } from "@/lib/sections";

export const metadata: Metadata = { title: "Crear usuario | Gallardo Camp 2026" };

type RegisterPageProps = { searchParams: Promise<{ error?: string }> };

const errorMessages: Record<string, string> = {
  duplicate: "Ese nombre de usuario ya está registrado.",
  missing: "Introduce un usuario y una contraseña.",
  username: "El usuario debe tener entre 3 y 32 caracteres y solo puede incluir letras, números, punto, guion o guion bajo.",
  displayName: "El nombre visible debe tener entre 2 y 80 caracteres.",
  password: "La contraseña debe tener al menos 6 caracteres.",
  config: "El acceso no está configurado todavía. Avísale al administrador.",
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  if (!(await isSectionEnabled("access"))) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Participantes</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Crear usuario</h1>
          <p className="mt-3 text-slate-600">Crea tu participante para acceder al perfil y sumar puntos.</p>
        </div>

        {error && errorMessages[error] && (
          <p role="alert" className="mt-8 rounded-2xl bg-red-50 p-4 text-center text-sm font-medium text-red-700">{errorMessages[error]}</p>
        )}

        <section className="mt-10 rounded-3xl border border-[var(--primary-border)] bg-[var(--primary-subtle)] p-6 shadow-sm sm:p-8">
          <form action="/login/register" method="post" className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Usuario
              <input name="username" autoComplete="username" required minLength={3} maxLength={32} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              <span>Nombre visible <span className="font-normal text-slate-500">(opcional)</span></span>
              <input name="displayName" autoComplete="name" minLength={2} maxLength={80} placeholder="Si lo dejas vacío, usaremos el usuario" className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Contraseña
              <input name="password" type="password" autoComplete="new-password" required minLength={6} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]" />
            </label>
            <button type="submit" className="mt-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white transition hover:bg-[var(--primary-dark)]">Crear y entrar</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes usuario?{" "}
            <Link href="/login" className="font-bold text-[var(--primary)] hover:underline">Iniciar sesión</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
