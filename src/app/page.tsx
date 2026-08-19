import Image from "next/image";
import Link from "next/link";
import { Schedule } from "@/features/schedule/Schedule";
import { getSafeSectionAuthentication, isSectionEnabled } from "@/lib/sections";
import { getSchedule } from "@/lib/activities";
import { cookies } from "next/headers";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";
import { getUserById } from "@/lib/users";

export default async function Home() {
  const [agendaAvailable, mapAvailable, sectionAuthentication, cookieStore] = await Promise.all([
    isSectionEnabled("agenda"),
    isSectionEnabled("map"),
    getSafeSectionAuthentication(),
    cookies(),
  ]);
  const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
  const activeUser = session ? await getUserById(session.activeUserId) : null;
  const hasSession = Boolean(activeUser);
  const agendaEnabled = agendaAvailable && (!sectionAuthentication.agenda || hasSession);
  const mapEnabled = mapAvailable && (!sectionAuthentication.map || hasSession);
  const schedule = agendaEnabled ? await getSchedule() : [];
  return (
    <main className="min-h-screen pb-20">
      <section className="relative isolate overflow-hidden bg-emerald-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-lime-300/30 blur-2xl" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-emerald-400/30 blur-3xl" />
        </div>

        <div className="relative mx-auto grid min-h-[72vh] max-w-6xl items-center gap-10 px-5 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.8fr] lg:gap-12">
          <div className="order-2 max-w-3xl text-center lg:order-1 lg:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
              28, 29 y 30 de agosto · La Romana
            </p>
            <h1 className="mt-5 text-6xl font-black tracking-[-0.05em] sm:text-8xl">
              Gallardo Camp 2026
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/85 sm:text-xl">
              Un fin de semana para reunirnos, jugar, cocinar, cantar y
              disfrutar en familia.
            </p>
            {(agendaEnabled || mapEnabled) && <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              {agendaEnabled && <Link
                href="/agenda"
                className="inline-flex rounded-2xl bg-[var(--accent)] px-6 py-3 font-bold text-white shadow-lg shadow-black/20 transition hover:bg-[var(--accent-hover)]"
              >
                Ver la agenda completa
              </Link>}
              {mapEnabled && <Link
                href="/mapa"
                className="inline-flex rounded-2xl border border-emerald-300/60 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Ver el mapa
              </Link>}
            </div>}
          </div>

          <div className="relative order-1 mx-auto w-[min(72vw,20rem)] lg:order-2 lg:w-full lg:max-w-96">
            <div
              aria-hidden="true"
              className="absolute inset-[7%] aspect-square rotate-6 rounded-[clamp(2.5rem,10vw,5rem)] shadow-2xl shadow-emerald-950/40"
            />
            <Image
              src="/gallardo-camp-logo-fire.png"
              alt="Gallardo Camp: Rama de Pino contra Raíz de Zanahoria"
              width={1235}
              height={1274}
              priority
              sizes="(max-width: 1023px) 78vw, 384px"
              className="relative h-auto w-full -rotate-2 drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {agendaEnabled && (
        <section className="pt-20">
          <Schedule schedule={schedule} canRequestPoints={hasSession} activeUserName={activeUser?.displayName} />
        </section>
      )}
    </main>
  );
}
