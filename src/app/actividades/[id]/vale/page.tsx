import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { UserAvatar } from "@/features/users/UserAvatar";
import { createActivityClaim, getActivity } from "@/lib/activities";
import { getUserById } from "@/lib/users";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export default async function ActivityVoucherPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ volver?: string }> }) {
  const { id } = await params;
  const { volver } = await searchParams;
  const returnHref = volver === "/agenda" || volver?.startsWith("/mapa?zona=") ? volver : "/agenda";
  const returnLabel = returnHref.startsWith("/mapa") ? "Volver al mapa" : "Volver a la agenda";
  const cookieStore = await cookies();
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");
  const [activity, claim, user] = await Promise.all([getActivity(id), createActivityClaim(id, session.activeUserId), getUserById(session.activeUserId)]);
  if (!activity) redirect("/agenda");
  if (!user) redirect("/login");
  const payload = JSON.stringify({ type: "gallardo-camp-activity", claimId: claim.id, activityId: id, userId: session.activeUserId });
  const qrCode = await QRCode.toDataURL(payload, { width: 420, margin: 2, color: { dark: "#052e16", light: "#ffffff" } });

  return <main className="min-h-screen px-4 py-10"><section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-lg sm:p-8"><p className="text-sm font-black uppercase tracking-[.2em] text-[var(--accent)]">Participación</p><h1 className="mt-3 text-3xl font-black">{activity.title}</h1><p className="mt-3 text-slate-600">{activity.participationPoints} puntos por participar</p><div className="mx-auto mt-6 flex max-w-sm items-center gap-3 rounded-2xl border border-[var(--primary-border)] bg-[var(--primary-subtle)] p-4 text-left"><UserAvatar user={user} className="h-12 w-12" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">QR generado para</p><p className="truncate text-lg font-black text-[var(--primary-dark)]">{user.displayName}</p><p className="truncate text-sm text-slate-500">@{user.username}</p></div></div><Image src={qrCode} alt={`QR de participación de ${user.displayName} en ${activity.title}`} width={420} height={420} unoptimized className="mx-auto mt-5 h-auto w-full max-w-80" /><p className="mt-4 font-bold text-[var(--primary-dark)]">Muestra este QR para validar la participación de {user.displayName}.</p><p className="mt-1 text-sm text-slate-500">Si no es la persona correcta, cambia el usuario activo antes de generar el QR.</p><Link href={returnHref} className="mt-6 inline-block rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700">{returnLabel}</Link></section></main>;
}
