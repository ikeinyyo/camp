import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VoucherCatalog } from "@/features/vouchers/VoucherCatalog";
import { isSectionEnabled } from "@/lib/sections";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";
import { getUserById } from "@/lib/users";
import { getVoucherState, listVouchers } from "@/lib/vouchers";

export const metadata: Metadata = { title: "Vales | Gallardo Camp 2026" };
export const dynamic = "force-dynamic";

export default async function VouchersPage({ searchParams }: { searchParams: Promise<{ proposed?: string; error?: string }> }) {
  if (!(await isSectionEnabled("vouchers"))) redirect("/");
  const cookieStore = await cookies();
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");
  const [user, state, params] = await Promise.all([getUserById(session.activeUserId), getVoucherState(), searchParams]);
  if (!user) redirect("/login");
  const vouchers = await listVouchers();

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent)]">{state === "proposals" ? "Call for vouchers" : "Ayuda y suma"}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Vales</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">{state === "proposals" ? "Ayúdanos a preparar el catálogo proponiendo tareas que puedan hacer la Gallardo Camp un poco mejor." : "Completa una tarea, solicita su vale y enséñame el QR para recibir los puntos."}</p>
        </header>
        {state === "proposals" ? (
          <div className="grid gap-10">
          <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[var(--primary-border)] bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-[var(--primary-dark)]">Propón un vale</h2>
            <p className="mt-2 leading-7 text-slate-600">Cuéntanos qué tarea propones y, si hace falta, explica brevemente en qué consiste. El organizador revisará las ideas antes de publicar el catálogo definitivo.</p>
            {params.proposed && <p role="status" className="mt-5 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-700">¡Propuesta enviada! Gracias por aportar una idea.</p>}
            {params.error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 font-bold text-red-700">No se pudo enviar. Escribe una propuesta de entre 10 y 500 caracteres.</p>}
            <form action="/vales/proponer" method="post" className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-bold">Tu propuesta<textarea name="text" required minLength={10} maxLength={500} rows={6} placeholder="Ej. Ayudar a preparar el desayuno: colocar las bebidas, los vasos y dejarlo todo listo antes de que llegue la familia." className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" /></label>
              <button className="min-h-12 rounded-xl bg-[var(--primary)] px-5 font-black text-white">Enviar propuesta</button>
            </form>
          </section>
          <section>
            <div className="mb-6 text-center"><h2 className="text-2xl font-black">Vales que ya tenemos</h2><p className="mt-2 text-slate-600">Consulta las tareas actuales para proponer algo diferente. Los QR estarán disponibles cuando empiece la Gallardo Camp.</p></div>
            <VoucherCatalog vouchers={vouchers} displayName={user.displayName} previewOnly />
          </section>
          </div>
        ) : <VoucherCatalog vouchers={vouchers} displayName={user.displayName} />}
      </section>
    </main>
  );
}
