"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BsArrowsFullscreen, BsCheckCircleFill, BsGiftFill, BsX } from "react-icons/bs";
import { LOTTERY_PRIZES, LOTTERY_PRIZE_SLOTS } from "@/config/lottery";
import { UserAvatar } from "@/features/users/UserAvatar";
import type { User } from "@/lib/users";

type Stage = "ready" | "spinning-user" | "user-selected" | "spinning-points" | "result" | "assigned";
type WheelItem = { key: string; label: string };

const WHEEL_COLORS = ["#d55212", "#f39a35", "#087653", "#12a071", "#f2bd58"];

function randomIndex(length: number) {
  const values = new Uint32Array(1);
  const ceiling = Math.floor(0x100000000 / length) * length;
  do crypto.getRandomValues(values); while (values[0] >= ceiling);
  return values[0] % length;
}

function targetRotation(current: number, selectedIndex: number, itemCount: number, turns = 5) {
  const segment = 360 / itemCount;
  return Math.ceil(current / 360) * 360 + turns * 360 - (selectedIndex * segment + segment / 2);
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function RouletteWheel({ items, rotation, spinning, children }: { items: WheelItem[]; rotation: number; spinning: boolean; children?: ReactNode }) {
  const segment = 360 / items.length;
  const background = `conic-gradient(${items.map((_, index) => `${WHEEL_COLORS[index % WHEEL_COLORS.length]} ${index * segment}deg ${(index + 1) * segment}deg`).join(",")})`;
  return <div className="relative mx-auto aspect-square w-[min(78vw,430px)] sm:w-[430px]">
    <div className="absolute left-1/2 top-[-7px] z-20 h-0 w-0 -translate-x-1/2 border-x-[15px] border-t-[28px] border-x-transparent border-t-white drop-shadow-lg" />
    <div className="absolute inset-0 rounded-full border-[10px] border-white bg-white shadow-2xl">
      <div className="absolute inset-1 overflow-hidden rounded-full border-4 border-emerald-950/30 transition-transform duration-[4200ms] ease-[cubic-bezier(.12,.68,.16,1)]" style={{ background, transform: `rotate(${rotation}deg)` }}>
        {items.map((item, index) => {
          const angle = (index + 0.5) * segment;
          const radians = angle * Math.PI / 180;
          return <span key={item.key} className={`absolute z-10 max-w-[22%] -translate-x-1/2 -translate-y-1/2 truncate text-center font-black text-white drop-shadow-[0_1px_1px_rgb(0_0_0/.45)] ${items.length > 14 ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"}`} style={{ left: `${50 + Math.sin(radians) * 36}%`, top: `${50 - Math.cos(radians) * 36}%` }}>{item.label}</span>;
        })}
      </div>
      <div className={`absolute left-1/2 top-1/2 z-10 grid h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-[7px] border-white bg-[var(--primary-dark)] p-2 text-center shadow-xl ${spinning ? "animate-pulse" : ""}`}>{children ?? <BsGiftFill className="text-4xl text-orange-300" />}</div>
    </div>
  </div>;
}

export function PointsLottery({ users }: { users: User[] }) {
  const [stage, setStage] = useState<Stage>("ready");
  const [winner, setWinner] = useState<User>();
  const [prize, setPrize] = useState<number>();
  const [drawId, setDrawId] = useState("");
  const [spectacle, setSpectacle] = useState(false);
  const [error, setError] = useState("");
  const [userRotation, setUserRotation] = useState(0);
  const [pointsRotation, setPointsRotation] = useState(0);
  const running = useRef(false);

  useEffect(() => {
    const update = () => { if (!document.fullscreenElement) setSpectacle(false); };
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  const userItems = users.map((user) => ({ key: user.id, label: users.length > 12 ? user.displayName.trim().charAt(0).toUpperCase() : user.displayName.trim().split(/\s+/)[0] }));
  const pointItems = LOTTERY_PRIZE_SLOTS.map((points, index) => ({ key: `${points}-${index}`, label: String(points) }));

  async function spinUsers() {
    if (running.current || users.length === 0) return;
    running.current = true;
    setError(""); setWinner(undefined); setPrize(undefined); setStage("spinning-user");
    const selectedIndex = randomIndex(users.length);
    setUserRotation((current) => targetRotation(current, selectedIndex, users.length));
    await new Promise((resolve) => window.setTimeout(resolve, 4300));
    setWinner(users[selectedIndex]); setStage("user-selected"); running.current = false;
  }

  async function spinPoints() {
    if (running.current || !winner) return;
    running.current = true;
    setPointsRotation(0);
    setStage("spinning-points");
    const selectedIndex = randomIndex(LOTTERY_PRIZE_SLOTS.length);
    await nextFrame();
    await nextFrame();
    setPointsRotation(targetRotation(0, selectedIndex, LOTTERY_PRIZE_SLOTS.length, 8));
    await new Promise((resolve) => window.setTimeout(resolve, 4300));
    setPrize(LOTTERY_PRIZE_SLOTS[selectedIndex]); setDrawId(crypto.randomUUID()); setStage("result"); running.current = false;
  }

  async function assignPoints() {
    if (!winner || !prize || !drawId || running.current) return;
    running.current = true; setError("");
    try {
      const response = await fetch("/admin/sorteo/award", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: winner.id, points: prize, drawId }) });
      const result = await response.json() as { ok: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message ?? "No se pudieron asignar los puntos.");
      setStage("assigned");
    } catch (caughtError) { setError(caughtError instanceof Error ? caughtError.message : "No se pudieron asignar los puntos."); }
    finally { running.current = false; }
  }

  function reset() { setStage("ready"); setWinner(undefined); setPrize(undefined); setDrawId(""); setError(""); }
  async function enterSpectacle() { setSpectacle(true); await document.documentElement.requestFullscreen?.().catch(() => undefined); }
  async function leaveSpectacle() { setSpectacle(false); if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined); }

  const pointsStage = stage === "spinning-points" || stage === "result" || stage === "assigned";
  const isSpinning = stage === "spinning-user" || stage === "spinning-points";

  return <section className={spectacle ? "fixed inset-0 z-[120] overflow-y-auto bg-[#f7faf8]" : ""}>
    <div className={`mx-auto flex max-w-5xl flex-col ${spectacle ? "min-h-dvh justify-center px-3 py-3 sm:px-8" : ""}`}>
      <div className={`relative overflow-hidden border border-emerald-900/10 bg-gradient-to-br from-[#073b25] via-[#075f42] to-[#0a7f58] text-white shadow-xl ${spectacle ? "rounded-[2rem]" : "rounded-3xl"}`}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/5" /><div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full border-[52px] border-orange-400/10" />
        <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-8"><div><p className="text-xs font-black uppercase tracking-[.24em] text-orange-300">Gallardo Camp 2026</p><h2 className="mt-1 text-xl font-black sm:text-2xl">Sorteo relámpago</h2></div>{spectacle ? <button type="button" onClick={leaveSpectacle} aria-label="Salir del modo espectáculo" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20"><BsX /></button> : <button type="button" onClick={enterSpectacle} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"><BsArrowsFullscreen /><span className="hidden sm:inline">Modo espectáculo</span></button>}</div>
        <div className={`relative grid place-items-center px-3 text-center sm:px-8 ${spectacle ? "min-h-[calc(100dvh-6rem)] py-4" : "min-h-[600px] py-8"}`}>
          {users.length === 0 ? <div><BsGiftFill className="mx-auto text-6xl text-orange-300" /><h3 className="mt-5 text-3xl font-black">No hay participantes</h3><p className="mt-3 text-white/70">Valida al menos un usuario para poder comenzar.</p></div> : <div className="flex w-full flex-col items-center">
            <div className="mb-3 flex h-12 shrink-0 items-center justify-center gap-3">
              {winner && pointsStage && <><UserAvatar user={winner} className="h-11 w-11 ring-2 ring-white/30" textClassName="text-sm" /><p className="max-w-[min(70vw,28rem)] truncate text-xl font-black sm:text-2xl">{winner.displayName}</p></>}
            </div>
            <RouletteWheel key={pointsStage ? "points" : "users"} items={pointsStage ? pointItems : userItems} rotation={pointsStage ? pointsRotation : userRotation} spinning={isSpinning}>
              {!pointsStage ? winner && stage === "user-selected" ? <div><UserAvatar user={winner} className="mx-auto h-16 w-16 sm:h-20 sm:w-20" textClassName="text-2xl" /><p className="mt-1 max-w-28 truncate text-sm font-black">{winner.displayName}</p></div> : <span className="text-sm font-black uppercase tracking-wider text-orange-200">{stage === "spinning-user" ? "Girando" : "Participantes"}</span> : prize && stage !== "spinning-points" ? <span className="text-5xl font-black text-orange-300 sm:text-6xl">+{prize}</span> : <span className="text-sm font-black uppercase tracking-wider text-orange-200">Girando</span>}
            </RouletteWheel>
            <div className="mt-5 flex min-h-24 w-full shrink-0 flex-col items-center justify-start">
              {stage === "ready" && <><p className="text-sm text-emerald-50/80 sm:text-base">Todos los participantes tienen la misma probabilidad.</p><button type="button" onClick={spinUsers} className="mt-4 rounded-2xl bg-orange-500 px-8 py-3.5 text-lg font-black shadow-lg transition hover:scale-105 hover:bg-orange-400">Girar ruleta</button></>}
              {stage === "spinning-user" && <p className="animate-pulse text-lg font-bold text-orange-300">Buscando participante…</p>}
              {stage === "user-selected" && <button type="button" onClick={spinPoints} className="rounded-2xl bg-orange-500 px-8 py-3.5 text-lg font-black shadow-lg transition hover:scale-105 hover:bg-orange-400">Girar ruleta de puntos</button>}
              {stage === "spinning-points" && <p className="animate-pulse text-lg font-bold text-orange-300">Sorteando los puntos…</p>}
              {stage === "result" && <div className="mx-auto grid max-w-md gap-3 sm:grid-cols-2"><button type="button" onClick={assignPoints} className="rounded-2xl bg-orange-500 px-6 py-3.5 font-black shadow-lg hover:bg-orange-400">Asignar {prize} puntos</button><button type="button" onClick={reset} className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 font-bold hover:bg-white/20">Cancelar</button></div>}
              {stage === "assigned" && <><p className="text-lg font-black text-emerald-100"><BsCheckCircleFill className="mr-2 inline text-orange-300" />Puntos asignados correctamente</p><button type="button" onClick={reset} className="mt-4 rounded-2xl bg-white px-8 py-3 font-black text-[var(--primary-dark)] shadow-lg hover:bg-emerald-50">Nuevo sorteo</button></>}
              {error && <p role="alert" className="mx-auto mt-4 max-w-md rounded-xl bg-red-950/40 p-3 text-sm font-bold text-red-100">{error}</p>}
            </div>
          </div>}
        </div>
      </div>
      {!spectacle && <div className="mt-5 flex flex-wrap justify-center gap-2">{LOTTERY_PRIZES.map((points) => <span key={points} className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-black text-orange-700">{points} puntos · {points === 3 ? "alta" : points === 2 || points === 5 ? "media" : "baja"}</span>)}</div>}
      {isSpinning && <span className="sr-only" aria-live="polite">Sorteo en curso</span>}
    </div>
  </section>;
}
