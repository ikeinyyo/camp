import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { createActivityClaim, getActivity } from "@/lib/activities";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export default async function ActivityVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  if (!session) redirect("/login");
  const [activity, claim] = await Promise.all([getActivity(id), createActivityClaim(id, session.activeUserId)]);
  if (!activity) redirect("/agenda");
  const payload = JSON.stringify({ type: "gallardo-camp-activity", claimId: claim.id, activityId: id, userId: session.activeUserId });
  const qrCode = await QRCode.toDataURL(payload, { width: 420, margin: 2, color: { dark: "#052e16", light: "#ffffff" } });

  return <main className="min-h-screen px-4 py-10"><section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-lg sm:p-8"><p className="text-sm font-black uppercase tracking-[.2em] text-[var(--accent)]">Participación</p><h1 className="mt-3 text-3xl font-black">{activity.title}</h1><p className="mt-3 text-slate-600">{activity.participationPoints} puntos por participar</p><Image src={qrCode} alt={`QR de participación en ${activity.title}`} width={420} height={420} unoptimized className="mx-auto mt-6 h-auto w-full max-w-80" /><p className="mt-4 font-bold text-[var(--primary-dark)]">Muestra este QR para validar tu participación.</p><a href="/agenda" className="mt-6 inline-block rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700">Volver a la agenda</a></section></main>;
}
