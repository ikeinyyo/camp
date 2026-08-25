"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BsArrowLeft,
  BsArrowRight,
  BsCalendarHeart,
  BsStars,
  BsTrophyFill,
} from "react-icons/bs";
import { UserAvatar } from "@/features/users/UserAvatar";
import type { RankedUser } from "@/lib/ranking";
import type { User } from "@/lib/users";

type FinalUser = RankedUser<User>;
const NEXT_EVENT = new Date("2027-08-27T00:00:00+02:00").getTime();
const placeStyles = [
  {
    label: "Primer puesto",
    color: "text-amber-400",
    glow: "from-amber-300/25",
    ring: "ring-amber-300",
  },
  {
    label: "Segundo puesto",
    color: "text-slate-300",
    glow: "from-slate-200/20",
    ring: "ring-slate-300",
  },
  {
    label: "Tercer puesto",
    color: "text-orange-400",
    glow: "from-orange-400/25",
    ring: "ring-orange-400",
  },
] as const;

function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, NEXT_EVENT - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const totalSeconds = Math.floor((remaining ?? 0) / 1000);
  const values = [
    [Math.floor(totalSeconds / 86400), "días"],
    [Math.floor(totalSeconds / 3600) % 24, "horas"],
    [Math.floor(totalSeconds / 60) % 60, "min"],
    [totalSeconds % 60, "seg"],
  ] as const;
  return (
    <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-4">
      {values.map(([value, label]) => (
        <div
          key={label}
          className="rounded-2xl border border-white/15 bg-white/10 px-2 py-4 backdrop-blur"
        >
          <strong className="block text-2xl tabular-nums sm:text-4xl">
            {remaining === null ? "--" : String(value).padStart(2, "0")}
          </strong>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-emerald-100/75 sm:text-xs">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function WinnerSlide({
  user,
  position,
}: {
  user?: FinalUser;
  position: 0 | 1 | 2;
}) {
  const style = placeStyles[position];
  return (
    <div
      className={`relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b ${style.glow} to-transparent px-6 py-12 text-center`}
    >
      <BsTrophyFill
        className={`text-6xl ${style.color} drop-shadow-xl sm:text-8xl`}
      />
      <p className="mt-6 text-sm font-black uppercase tracking-[.25em] text-emerald-200">
        {style.label}
      </p>
      {user ? (
        <>
          <UserAvatar
            user={user}
            className={`mt-7 h-28 w-28 ring-4 ${style.ring} sm:h-36 sm:w-36`}
            textClassName="text-4xl"
          />
          <h2 className="mt-6 text-3xl font-black sm:text-5xl">
            {user.displayName}
          </h2>
          <p className="mt-2 text-lg text-emerald-100/75">@{user.username}</p>
          <p className={`mt-5 text-5xl font-black ${style.color} sm:text-7xl`}>
            {user.points}{" "}
            <span className="text-xl text-white sm:text-2xl">puntos</span>
          </p>
        </>
      ) : (
        <p className="mt-8 text-xl text-emerald-100/70">
          Puesto pendiente de participante
        </p>
      )}
    </div>
  );
}

export function FinalScoreCarousel({
  users,
  showPrizes,
}: {
  users: FinalUser[];
  showPrizes: boolean;
}) {
  const [slide, setSlide] = useState(0);
  const touchStart = useRef<number | null>(null);
  const rankingSlide = showPrizes ? 5 : 4;
  const thanksSlide = rankingSlide + 1;
  const slides = thanksSlide + 1;
  const go = (next: number) =>
    setSlide(Math.min(Math.max(next, 0), slides - 1));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft")
        setSlide((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight")
        setSlide((current) => Math.min(slides - 1, current + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides]);

  return (
    <main className="min-h-screen bg-[var(--primary-dark)] px-3 py-5 text-white sm:px-6 sm:py-8">
      <section
        aria-roledescription="carrusel"
        aria-label="Resultados finales Gallardo Camp 2026"
        className="mx-auto max-w-5xl"
      >
        <div
          className="relative h-[calc(100dvh-8rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-emerald-950 shadow-2xl"
          onTouchStart={(event) => {
            touchStart.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchStart.current === null) return;
            const distance =
              event.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(distance) > 55) go(slide + (distance < 0 ? 1 : -1));
            touchStart.current = null;
          }}
        >
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${slide * 100}%)` }}
          >
            <article
              aria-hidden={slide !== 0}
              className="flex w-full shrink-0 flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#166534_0%,#052e16_55%,#022c22_100%)] px-6 py-14 text-center"
            >
              <BsStars className="text-7xl text-orange-400 sm:text-9xl" />
              <p className="mt-8 text-sm font-black uppercase tracking-[.3em] text-orange-400">
                Final Score
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-7xl">
                Estos son los resultados finales de la Gallardo Camp 2026
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-emerald-100/75">
                Tres días, muchos retos y una familia dispuesta a darlo todo.
              </p>
            </article>
            <article aria-hidden={slide !== 1} className="w-full shrink-0">
              <WinnerSlide user={users[0]} position={0} />
            </article>
            <article aria-hidden={slide !== 2} className="w-full shrink-0">
              <WinnerSlide user={users[1]} position={1} />
            </article>
            <article aria-hidden={slide !== 3} className="w-full shrink-0">
              <WinnerSlide user={users[2]} position={2} />
            </article>
            {showPrizes && (
              <article
                aria-hidden={slide !== 4}
                className="flex w-full shrink-0 flex-col items-center justify-center px-4 py-10 sm:px-10"
              >
                <p className="text-sm font-black uppercase tracking-[.25em] text-orange-400">
                  Gallardo Camp 2026
                </p>
                <h2 className="mt-3 text-4xl font-black sm:text-5xl">
                  Los premios
                </h2>
                <Image
                  src="/images/premios.png"
                  alt="Premios de la Gallardo Camp 2026"
                  width={1672}
                  height={941}
                  className="mt-8 h-auto max-h-[58dvh] w-auto max-w-full rounded-3xl object-contain shadow-2xl"
                />
                <p className="mt-5 max-w-2xl text-center text-sm font-semibold leading-6 text-emerald-100/80 sm:text-base mb-8">
                  Los tres ganadores elegirán uno de los premios por orden de
                  clasificación.
                </p>
              </article>
            )}
            <article
              aria-hidden={slide !== rankingSlide}
              className="flex h-full min-h-0 w-full shrink-0 flex-col px-4 pb-20 pt-8 sm:px-10 sm:pt-10"
            >
              <div className="shrink-0">
                <p className="text-center text-sm font-black uppercase tracking-[.25em] text-orange-400">
                  Clasificación definitiva
                </p>
                <h2 className="mt-2 text-center text-3xl font-black sm:mt-3 sm:text-5xl">
                  Ranking global
                </h2>
              </div>
              <div className="mx-auto mt-5 min-h-0 w-full max-w-3xl flex-1 overflow-y-auto overscroll-contain pr-1 sm:mt-8 sm:pr-2">
                <div className="grid gap-3">
                  {users.map((user, index) => (
                    <Link
                      key={user.id}
                      href={`/perfil/${encodeURIComponent(user.username)}`}
                      className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 sm:p-4 ${index < 3 ? "border-orange-400/40 bg-orange-400/10" : "border-white/10 bg-white/5"}`}
                    >
                      <span
                        className={`w-10 shrink-0 text-center text-xl font-black ${index === 0 ? "text-amber-400" : index === 1 ? "text-slate-300" : index === 2 ? "text-orange-400" : "text-emerald-100/60"}`}
                      >
                        {user.rank}.º
                      </span>
                      <UserAvatar
                        user={user}
                        className="h-11 w-11 sm:h-12 sm:w-12"
                      />
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate">
                          {user.displayName}
                        </strong>
                        <span className="block truncate text-sm text-emerald-100/60">
                          {user.status || `@${user.username}`}
                        </span>
                      </span>
                      <strong className="shrink-0 text-lg text-orange-400 sm:text-xl">
                        {user.points}
                      </strong>
                    </Link>
                  ))}
                </div>
              </div>
            </article>
            <article
              aria-hidden={slide !== thanksSlide}
              className="flex w-full shrink-0 flex-col items-center justify-center bg-[radial-gradient(circle_at_bottom,#14532d_0%,#052e16_55%,#022c22_100%)] px-5 py-12 text-center"
            >
              <BsCalendarHeart className="text-6xl text-orange-400 sm:text-8xl" />
              <p className="mt-7 text-sm font-black uppercase tracking-[.25em] text-orange-400">
                Gracias, familia
              </p>
              <h2 className="mt-4 text-4xl font-black sm:text-6xl">
                Nos vemos en la Gallardo Camp 2027
              </h2>
              <p className="mt-4 text-lg font-bold text-emerald-100/80">
                27, 28 y 29 de agosto de 2027
              </p>
              <div className="w-full max-w-2xl">
                <Countdown />
              </div>
            </article>
          </div>
          <button
            type="button"
            onClick={() => go(slide - 1)}
            disabled={slide === 0}
            aria-label="Diapositiva anterior"
            className="absolute bottom-5 left-4 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/25 text-xl backdrop-blur disabled:invisible sm:left-6"
          >
            <BsArrowLeft />
          </button>
          <button
            type="button"
            onClick={() => go(slide + 1)}
            disabled={slide === slides - 1}
            aria-label="Diapositiva siguiente"
            className="absolute bottom-5 right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-orange-500 text-xl shadow-lg disabled:invisible sm:right-6"
          >
            <BsArrowRight />
          </button>
          <div
            className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2"
            aria-label={`Diapositiva ${slide + 1} de ${slides}`}
          >
            {Array.from({ length: slides }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => go(index)}
                aria-label={`Ir a la diapositiva ${index + 1}`}
                aria-current={slide === index ? "step" : undefined}
                className={`h-2.5 rounded-full transition-all ${slide === index ? "w-7 bg-orange-400" : "w-2.5 bg-white/35"}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
