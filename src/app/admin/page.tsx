import type { Metadata } from "next";
import Link from "next/link";
import { AdminNavigation } from "@/features/admin/AdminNavigation";
import { listUsers, type User } from "@/lib/users";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administración | Gallardo Camp 2026",
};

type AdminHomePageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

const errorMessages: Record<string, string> = {
  duplicate: "Ese nombre de usuario ya está en uso.",
  validation: "Revisa los datos introducidos.",
  storage: "No se pudo guardar el usuario en Azure Table Storage.",
};

export default async function AdminHomePage({ searchParams }: AdminHomePageProps) {
  const { saved, error } = await searchParams;
  let users: User[] = [];
  let storageError = "";
  try {
    users = await listUsers();
  } catch (caughtError) {
    storageError =
      caughtError instanceof Error
        ? caughtError.message
        : "No se pudo conectar con Azure Table Storage.";
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-7xl">
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

        <AdminNavigation active="users" />

        <section className="py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Usuarios</h2>
              <p className="mt-2 text-slate-600">
                Edita los datos, puntos o establece una contraseña nueva.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[var(--primary-subtle)] px-4 py-2 text-sm font-bold text-[var(--primary-dark)]">
                {users.length} {users.length === 1 ? "usuario" : "usuarios"}
              </span>
              <Link href="/admin/users/new" className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary-dark)]">
                + Crear usuario
              </Link>
            </div>
          </div>

          {(saved === "true" || saved === "created") && (
            <p role="status" className="mt-6 rounded-2xl bg-[var(--primary-subtle)] p-4 text-sm font-semibold text-[var(--primary-dark)]">
              {saved === "created" ? "Usuario creado correctamente." : "Usuario guardado correctamente."}
            </p>
          )}
          {error && errorMessages[error] && (
            <p role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessages[error]}
            </p>
          )}
          {storageError && (
            <div role="alert" className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
              <p className="font-bold">Azure Table Storage no está disponible</p>
              <p className="mt-1 break-words">{storageError}</p>
            </div>
          )}

          {!storageError && users.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-600">
              Todavía no hay usuarios registrados.
            </div>
          )}

          {users.length > 0 && (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(15_23_42/0.06)]">
              <table className="w-full min-w-[960px] border-collapse text-left">
                <caption className="sr-only">Gestión de usuarios registrados</caption>
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th scope="col" className="px-5 py-4">Usuario</th>
                    <th scope="col" className="px-5 py-4">Nombre visible</th>
                    <th scope="col" className="w-32 px-5 py-4">Puntos</th>
                    <th scope="col" className="px-5 py-4">Cambiar contraseña</th>
                    <th scope="col" className="w-32 px-5 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user, index) => {
                    const formId = `edit-user-${index}`;
                    const inputClassName =
                      "w-full rounded-lg border border-transparent bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-300 hover:bg-white focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent-soft)]";

                    return (
                      <tr key={user.id} className="odd:bg-white even:bg-slate-50/40 transition hover:bg-[var(--primary-subtle)]/40">
                        <td className="px-5 py-4">
                          <form id={formId} action={`/admin/users/${user.id}`} method="post" />
                          <label className="sr-only" htmlFor={`${formId}-username`}>Usuario</label>
                          <div className="flex items-center gap-3">
                            <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-black uppercase text-white shadow-sm">
                              {user.displayName.charAt(0)}
                            </span>
                            <input id={`${formId}-username`} form={formId} name="username" defaultValue={user.username} required minLength={3} maxLength={32} className={inputClassName} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <label className="sr-only" htmlFor={`${formId}-display-name`}>Nombre visible</label>
                          <input id={`${formId}-display-name`} form={formId} name="displayName" defaultValue={user.displayName} required minLength={2} maxLength={80} className={inputClassName} />
                        </td>
                        <td className="px-5 py-4">
                          <label className="sr-only" htmlFor={`${formId}-points`}>Puntos</label>
                          <input id={`${formId}-points`} form={formId} name="points" type="number" min={0} step={1} defaultValue={user.points} required className={inputClassName} />
                        </td>
                        <td className="px-5 py-4">
                          <label className="sr-only" htmlFor={`${formId}-password`}>Nueva contraseña</label>
                          <input id={`${formId}-password`} form={formId} name="password" type="password" minLength={6} autoComplete="new-password" placeholder="Dejar en blanco para mantener" className={`${inputClassName} placeholder:text-xs`} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button form={formId} type="submit" className="rounded-lg border border-[var(--accent)] bg-white px-4 py-2 text-sm font-bold text-[var(--accent-hover)] transition hover:bg-[var(--accent)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]">
                            Guardar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
