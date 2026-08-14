import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VoucherCatalog } from "@/features/vouchers/VoucherCatalog";
import { isSectionEnabled } from "@/lib/sections";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";
import { getUserById } from "@/lib/users";
import { listVouchers } from "@/lib/vouchers";

export const metadata: Metadata = { title: "Vales | Gallardo Camp 2026" };
export const dynamic = "force-dynamic";

export default async function VouchersPage() {
  if (!(await isSectionEnabled("vouchers"))) redirect("/");
  const cookieStore = await cookies();
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");
  const [user, vouchers] = await Promise.all([getUserById(session.activeUserId), listVouchers()]);
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Ayuda y suma</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Vales</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">Completa una tarea, solicita su vale y enséñame el QR para recibir los puntos.</p>
        </header>
        <VoucherCatalog vouchers={vouchers} displayName={user.displayName} />
      </section>
    </main>
  );
}
