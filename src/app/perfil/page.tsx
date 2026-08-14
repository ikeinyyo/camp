import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { rankUsers } from "@/lib/ranking";
import { isSectionEnabled } from "@/lib/sections";
import { getUsersByIds, listUsers } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const metadata: Metadata = {
  title: "Perfil | Gallardo Camp 2026",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (!(await isSectionEnabled("profile"))) redirect("/");

  const cookieStore = await cookies();
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");

  const [users, allUsers] = await Promise.all([
    getUsersByIds(session.userIds),
    listUsers(),
  ]);
  const user = users.find((candidate) => candidate.id === session.activeUserId);
  if (!user) redirect("/login");
  const rankedUser = rankUsers(allUsers).find(
    (candidate) => candidate.id === user.id,
  );

  const qrCode = await QRCode.toDataURL(user.username, {
    width: 360,
    margin: 2,
    color: { dark: "#052e16", light: "#ffffff" },
  });

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[var(--primary-dark)] px-6 py-8 text-center text-white">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-400">
            Perfil activo
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">{user.displayName}</h1>
          <p className="mt-2 text-emerald-100">@{user.username}</p>
        </div>
        <div className="grid place-items-center p-6 sm:p-10">
          <div className="grid w-full max-w-sm grid-cols-2 divide-x divide-orange-200 rounded-3xl bg-[var(--accent-subtle)] px-4 py-4 text-center">
            <div className="px-3">
              <span className="block text-4xl font-black text-[var(--accent)]">{user.points}</span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-600">puntos</span>
            </div>
            <div className="px-3">
              <span className="block text-4xl font-black text-[var(--primary-dark)]">{rankedUser ? `${rankedUser.rank}.º` : "—"}</span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-600">ranking</span>
            </div>
          </div>
          <Image
            src={qrCode}
            alt={`Código QR de ${user.username}`}
            width={360}
            height={360}
            unoptimized
            className="mt-8 h-auto w-full max-w-72"
          />
          <p className="mt-3 text-center text-sm text-slate-500">
            Este QR identifica a <strong>@{user.username}</strong>.
          </p>
        </div>
      </section>
    </main>
  );
}
