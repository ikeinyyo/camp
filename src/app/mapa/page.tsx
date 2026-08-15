import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { InteractiveEventMap, type MapActivity } from "@/features/map/InteractiveEventMap";
import { getMapZone, MAP_ZONES } from "@/config/locations";
import { listActivities } from "@/lib/activities";
import { isSectionEnabled } from "@/lib/sections";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";

export const metadata: Metadata = { title: "Mapa | Gallardo Camp 2026" };
export const dynamic = "force-dynamic";

export default async function MapPage({ searchParams }: { searchParams: Promise<{ zona?: string }> }) {
  if (!(await isSectionEnabled("map"))) redirect("/");
  const { zona } = await searchParams;
  const initialZoneId = MAP_ZONES.find((zone) => zone.id === zona)?.id;
  const [activities, cookieStore] = await Promise.all([listActivities(), cookies()]);
  const hasSession = Boolean(readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value));
  const mapped: MapActivity[] = activities.map((activity) => ({
    id: activity.id,
    zoneId: getMapZone(activity.location)?.id,
    title: activity.title,
    description: activity.description,
    date: activity.date,
    shortDate: activity.shortDate,
    start: activity.start,
    end: activity.end,
    location: activity.location,
    required: activity.required,
    participationPoints: activity.participationPoints,
    podiumPoints: activity.podiumPoints,
  }));

  return <main className="min-h-screen px-3 py-8 sm:px-6 sm:py-12"><section className="mx-auto max-w-6xl"><header className="mb-8 text-center"><p className="text-sm font-bold uppercase tracking-[.25em] text-[var(--accent)]">Gallardo Camp 2026</p><h1 className="mt-3 text-4xl font-black">Mapa del evento</h1><p className="mx-auto mt-3 max-w-2xl text-slate-600">Explora las zonas del recinto y descubre qué actividades se celebran en cada una.</p></header><InteractiveEventMap activities={mapped} initialZoneId={initialZoneId} canRequestPoints={hasSession} /></section></main>;
}
