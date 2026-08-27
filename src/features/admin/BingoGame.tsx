"use client";

import { useEffect, useRef, useState } from "react";
import { BsArrowsFullscreen, BsCheckCircleFill, BsX } from "react-icons/bs";
import { ConfirmDialog } from "@/features/ui/ConfirmDialog";
import type { BingoPrize, BingoState } from "@/lib/bingo";
import type { User } from "@/lib/users";

type Confirmation = { kind: "reset" } | { kind: "award"; prize: BingoPrize; userName: string };

function randomBall() {
  return Math.floor(Math.random() * 90) + 1;
}

export function BingoGame({ initialState, users }: { initialState: BingoState; users: User[] }) {
  const [drawnNumbers, setDrawnNumbers] = useState(initialState.drawnNumbers);
  const [currentNumber, setCurrentNumber] = useState(initialState.currentNumber);
  const [displayNumber, setDisplayNumber] = useState(initialState.currentNumber);
  const [busy, setBusy] = useState(false);
  const [spectacle, setSpectacle] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string }>();
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const drawRef = useRef<() => void>(() => undefined);
  const busyRef = useRef(false);

  const complete = drawnNumbers.length === 90;

  async function draw() {
    if (busyRef.current || complete) return;
    busyRef.current = true; setBusy(true); setFeedback(undefined);
    try {
      const response = await fetch("/admin/bingo/draw", { method: "POST" });
      const result = await response.json() as { ok: boolean; number?: number; state?: BingoState; message?: string };
      if (!response.ok || !result.ok || !result.number || !result.state) throw new Error(result.message ?? "No se pudo extraer la bola.");
      for (let index = 0; index < 7; index += 1) {
        setDisplayNumber(randomBall());
        await new Promise((resolve) => window.setTimeout(resolve, 35 + index * 2));
      }
      setDisplayNumber(result.number); setCurrentNumber(result.number); setDrawnNumbers(result.state.drawnNumbers);
    } catch (error) { setFeedback({ type: "error", message: error instanceof Error ? error.message : "No se pudo extraer la bola." }); }
    finally { busyRef.current = false; setBusy(false); }
  }

  useEffect(() => {
    drawRef.current = () => { void draw(); };
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.code !== "Space" || event.repeat || target?.closest("button, input, select, textarea, a, [contenteditable=true]")) return;
      event.preventDefault(); drawRef.current();
    };
    const onFullscreen = () => { if (!document.fullscreenElement) setSpectacle(false); };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => { window.removeEventListener("keydown", onKeyDown); document.removeEventListener("fullscreenchange", onFullscreen); };
  }, []);

  async function reset() {
    busyRef.current = true; setBusy(true); setFeedback(undefined);
    try {
      const response = await fetch("/admin/bingo/reset", { method: "POST" });
      const result = await response.json() as { ok: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message ?? "No se pudo reiniciar el bingo.");
      setDrawnNumbers([]); setCurrentNumber(undefined); setDisplayNumber(undefined);
    } catch (error) { setFeedback({ type: "error", message: error instanceof Error ? error.message : "No se pudo reiniciar el bingo." }); }
    finally { busyRef.current = false; setBusy(false); }
  }

  async function award(prize: BingoPrize) {
    if (!selectedUserId || busyRef.current) return;
    busyRef.current = true; setBusy(true); setFeedback(undefined);
    try {
      const response = await fetch("/admin/bingo/award", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: selectedUserId, prize }) });
      const result = await response.json() as { ok: boolean; displayName?: string; points?: number; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message ?? "No se pudo asignar el premio.");
      setFeedback({ type: "success", message: `${result.displayName} ha recibido ${result.points} puntos.` });
    } catch (error) { setFeedback({ type: "error", message: error instanceof Error ? error.message : "No se pudo asignar el premio." }); }
    finally { busyRef.current = false; setBusy(false); }
  }

  async function enterSpectacle() { setSpectacle(true); await document.documentElement.requestFullscreen?.().catch(() => undefined); }
  async function leaveSpectacle() { setSpectacle(false); if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined); }

  function requestAward(prize: BingoPrize) {
    if (!selectedUserId || busyRef.current) return;
    const user = users.find((item) => item.id === selectedUserId);
    setConfirmation({ kind: "award", prize, userName: user?.displayName ?? "este participante" });
  }

  function confirmAction() {
    const action = confirmation;
    setConfirmation(undefined);
    if (action?.kind === "reset") void reset();
    if (action?.kind === "award") void award(action.prize);
  }

  const drawn = new Set(drawnNumbers);
  const recent = [...drawnNumbers].reverse().slice(0, 8);

  return <section className={spectacle ? "fixed inset-0 z-[120] overflow-y-auto bg-[#f6f8f7]" : ""}>
    <div className={`mx-auto max-w-6xl ${spectacle ? "min-h-dvh p-3 sm:p-6" : ""}`}>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 bg-[var(--primary-dark)] px-4 py-4 text-white sm:px-7"><div><p className="text-xs font-black uppercase tracking-[.22em] text-orange-300">Gallardo Camp 2026</p><h2 className="mt-1 text-2xl font-black">Bingo</h2></div>{spectacle ? <button type="button" onClick={leaveSpectacle} aria-label="Salir del modo espectáculo" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl"><BsX /></button> : <button type="button" onClick={enterSpectacle} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"><BsArrowsFullscreen /><span className="hidden sm:inline">Modo espectáculo</span></button>}</div>

        <div className="grid gap-5 p-4 sm:p-7 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="flex flex-col items-center rounded-3xl bg-gradient-to-br from-[#073b25] to-[#087653] p-5 text-center text-white">
            <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-100">Última bola</p>
            <div className={`mt-4 grid aspect-square w-40 place-items-center rounded-full border-[10px] border-white bg-orange-500 text-7xl font-black tabular-nums shadow-xl sm:w-44 ${busy ? "animate-pulse" : ""}`}>{displayNumber ?? "—"}</div>
            <button type="button" onClick={draw} disabled={busy || complete} className="mt-5 w-full rounded-2xl bg-white px-5 py-3.5 font-black text-[var(--primary-dark)] shadow disabled:cursor-not-allowed disabled:opacity-50">{complete ? "Han salido todas" : busy ? "Sacando bola…" : "Sacar bola"}</button>
            <p className="mt-2 text-xs text-emerald-100/75">También puedes pulsar la barra espaciadora</p>
            {recent.length > 0 && <div className="mt-5 w-full border-t border-white/15 pt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-100/75">Anteriores</p><div className="flex flex-wrap justify-center gap-2">{recent.slice(currentNumber ? 1 : 0).map((number) => <span key={number} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-black">{number}</span>)}</div></div>}
          </div>

          <div className="min-w-0"><div className="mb-4 flex items-end justify-between gap-3"><div><h3 className="text-xl font-black">Panel de números</h3><p className="text-sm text-slate-500">{drawnNumbers.length} de 90 bolas extraídas</p></div><button type="button" onClick={() => setConfirmation({ kind: "reset" })} disabled={busy || drawnNumbers.length === 0} className="shrink-0 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-40">Reiniciar</button></div>
            <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}>{Array.from({ length: 90 }, (_, index) => index + 1).map((number) => <span key={number} className={`grid aspect-square min-w-0 place-items-center rounded-md text-[11px] font-black tabular-nums transition sm:rounded-lg sm:text-base ${number === currentNumber ? "scale-110 bg-orange-500 text-white shadow-md ring-2 ring-orange-200" : drawn.has(number) ? "bg-[var(--primary)] text-white" : "bg-slate-100 text-slate-500"}`}>{number}</span>)}</div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-7"><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"><div><h3 className="text-xl font-black">Premios de puntos</h3><p className="mt-1 text-sm text-slate-600">Selecciona al ganador y confirma el premio.</p><label className="mt-3 block"><span className="sr-only">Participante</span><select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold outline-none focus:border-[var(--primary)]"><option value="">Selecciona un participante</option>{users.map((user) => <option key={user.id} value={user.id}>{user.displayName}</option>)}</select></label></div><div className="grid content-end gap-2 sm:grid-cols-2"><button type="button" onClick={() => requestAward("line")} disabled={!selectedUserId || busy} className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white disabled:opacity-40">Línea · +3 puntos</button><button type="button" onClick={() => requestAward("bingo")} disabled={!selectedUserId || busy} className="rounded-xl bg-[var(--accent)] px-6 py-3 font-black text-white disabled:opacity-40">Bingo · +5 puntos</button></div></div>
          {feedback && <p role={feedback.type === "error" ? "alert" : "status"} className={`mt-4 rounded-xl p-3 text-sm font-bold ${feedback.type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{feedback.type === "success" && <BsCheckCircleFill className="mr-2 inline" />}{feedback.message}</p>}
        </div>
      </div>
      <ConfirmDialog open={Boolean(confirmation)} tone={confirmation?.kind === "reset" ? "danger" : "accent"} title={confirmation?.kind === "reset" ? "Reiniciar bingo" : confirmation?.prize === "line" ? "Asignar premio de línea" : "Asignar premio de bingo"} description={confirmation?.kind === "reset" ? "Se borrarán todas las bolas extraídas y el panel volverá a mostrar los 90 números disponibles." : `Se asignarán ${confirmation?.prize === "line" ? 3 : 5} puntos a ${confirmation?.kind === "award" ? confirmation.userName : "el participante seleccionado"}.`} confirmLabel={confirmation?.kind === "reset" ? "Sí, reiniciar" : "Asignar puntos"} onClose={() => setConfirmation(undefined)} onConfirm={confirmAction} />
    </div>
  </section>;
}
