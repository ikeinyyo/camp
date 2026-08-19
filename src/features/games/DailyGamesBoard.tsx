"use client";

import { useEffect, useState } from "react";
import { BsBarChartFill, BsCheckCircleFill, BsFire, BsLightbulbFill, BsPatchQuestionFill, BsXCircleFill } from "react-icons/bs";
import type { DailyGameKind } from "@/config/daily-games";
import type { DailyGameAttempt, DailyPollResults } from "@/lib/daily-games";

export type PublicDailyGames = {
  date: string;
  trivia: { prompt: string; options: string[] };
  word: { prompt: string; length: number; hint?: string };
  poll: { prompt: string; options: string[] };
};

const gameMeta = {
  trivia: { title: "Trivia diaria", eyebrow: "Pon a prueba tu memoria", icon: BsPatchQuestionFill },
  word: { title: "Palabra diaria", eyebrow: "Una palabra, una oportunidad", icon: BsLightbulbFill },
  poll: { title: "Encuesta diaria", eyebrow: "La opinión de la familia", icon: BsBarChartFill },
} as const;

function PollResults({ options, results, selected }: { options: string[]; results: DailyPollResults; selected: number }) {
  return <div className="mt-5 grid gap-3"><p className="text-sm font-bold text-slate-600">Resultados actualizados · {results.total} {results.total === 1 ? "voto" : "votos"}</p>{options.map((option, index) => { const count = results.counts[index] ?? 0; const percentage = results.total ? Math.round(count * 100 / results.total) : 0; return <div key={option}><div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className={`min-w-0 truncate font-bold ${selected === index ? "text-[var(--accent)]" : "text-slate-700"}`}>{option}{selected === index ? " · Tu voto" : ""}</span><span className="shrink-0 font-black">{percentage}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${selected === index ? "bg-[var(--accent)]" : "bg-[var(--primary)]"}`} style={{ width: `${percentage}%` }} /></div><span className="mt-1 block text-xs text-slate-500">{count} {count === 1 ? "voto" : "votos"}</span></div>; })}</div>;
}

function DailyGameCard({ kind, games, initialAttempt, initialPollResults, onAttempt }: { kind: DailyGameKind; games: PublicDailyGames; initialAttempt?: DailyGameAttempt; initialPollResults?: DailyPollResults; onAttempt: (attempt: DailyGameAttempt) => void }) {
  const challenge = games[kind];
  const wordChallenge = games.word;
  const choiceChallenge = kind === "trivia" ? games.trivia : games.poll;
  const meta = gameMeta[kind];
  const Icon = meta.icon;
  const storageKey = `gallardo-camp-game-draft:${games.date}:${kind}`;
  const [answer, setAnswer] = useState(initialAttempt?.answer ?? "");
  const [attempt, setAttempt] = useState(initialAttempt);
  const [pollResults, setPollResults] = useState(initialPollResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (initialAttempt) return;
    const timer = window.setTimeout(() => setAnswer(window.localStorage.getItem(storageKey) ?? ""), 0);
    return () => window.clearTimeout(timer);
  }, [initialAttempt, storageKey]);

  useEffect(() => {
    if (kind !== "poll" || !attempt) return;
    const refresh = async () => {
      const response = await fetch(`/api/games/poll-results?date=${encodeURIComponent(games.date)}`);
      if (response.ok) setPollResults(await response.json());
    };
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(timer);
  }, [attempt, games.date, kind]);

  function choose(value: string) {
    setAnswer(value);
    window.localStorage.setItem(storageKey, value);
    setError("");
  }

  async function submit() {
    if (!answer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/games/attempt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: games.date, kind, answer }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAttempt(data.attempt);
      setExplanation(data.explanation ?? "");
      if (data.pollResults) setPollResults(data.pollResults);
      window.localStorage.removeItem(storageKey);
      onAttempt(data.attempt);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo guardar el intento.");
    } finally {
      setLoading(false);
    }
  }

  const isPoll = kind === "poll";
  return <article className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${attempt ? attempt.correct ? "border-emerald-300" : "border-red-200" : "border-slate-200"}`}>
    <header className="flex items-center gap-4 border-b border-slate-100 p-5 sm:p-6"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary-subtle)] text-2xl text-[var(--primary)]"><Icon /></span><div className="min-w-0"><p className="text-xs font-black uppercase tracking-[.16em] text-[var(--accent)]">{meta.eyebrow}</p><h2 className="mt-1 text-xl font-black">{meta.title}</h2></div><span className="ml-auto shrink-0 rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-sm font-black text-[var(--accent)]">+1 punto</span></header>
    <div className="p-5 sm:p-6"><p className="text-lg font-bold leading-7 text-slate-900">{challenge.prompt}</p>
      {kind === "word" && <><div className="mt-4 flex flex-wrap gap-1.5" aria-label={`${wordChallenge.length} letras`}>{Array.from({ length: wordChallenge.length }, (_, index) => <span key={index} className="grid h-9 w-8 place-items-center rounded-lg border-2 border-[var(--primary-border)] bg-[var(--primary-subtle)] text-sm font-black text-[var(--primary-dark)]">{attempt ? answer[index]?.toUpperCase() ?? "" : ""}</span>)}</div>{wordChallenge.hint && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900"><strong>Pista:</strong> {wordChallenge.hint}</p>}</>}
      {attempt ? isPoll ? <><div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-800"><div className="flex items-center gap-3"><BsCheckCircleFill className="text-2xl" /><strong>Voto registrado. Has ganado 1 punto.</strong></div></div>{pollResults && <PollResults options={games.poll.options} results={pollResults} selected={Number(answer)} />}</> : <div className={`mt-6 rounded-2xl p-5 ${attempt.correct ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}><div className="flex items-center gap-3">{attempt.correct ? <BsCheckCircleFill className="shrink-0 text-2xl" /> : <BsXCircleFill className="shrink-0 text-2xl" />}<strong className="text-lg">{attempt.correct ? "¡Correcto! Has ganado 1 punto." : "No era la respuesta correcta."}</strong></div>{explanation && <p className="mt-3 text-sm leading-6">{explanation}</p>}<p className="mt-3 text-xs font-bold uppercase tracking-wider opacity-70">Reto completado · No hay más intentos</p></div> : <>
        {kind === "word" ? <label className="mt-5 grid gap-2 text-sm font-bold">Tu respuesta<input value={answer} onChange={(event) => choose(event.target.value)} maxLength={wordChallenge.length + 3} autoComplete="off" autoCapitalize="none" placeholder={`${wordChallenge.length} letras`} className="min-h-12 rounded-xl border border-slate-300 px-4 text-base font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" /></label> : <div className="mt-5 grid gap-2">{choiceChallenge.options.map((option, index) => <button key={option} type="button" onClick={() => choose(String(index))} className={`min-h-12 rounded-xl border px-4 py-3 text-left font-bold transition ${answer === String(index) ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent-hover)] ring-2 ring-[var(--accent-soft)]" : "border-slate-200 hover:bg-slate-50"}`}><span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-sm">{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>}
        {!isPoll && <p className="mt-4 text-center text-xs font-semibold text-slate-500">Solo tienes un intento.</p>}<button type="button" onClick={() => void submit()} disabled={!answer.trim() || loading} className="mt-2 min-h-12 w-full rounded-xl bg-[var(--primary)] px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Guardando…" : isPoll ? "Votar" : "Confirmar respuesta"}</button>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      </>}
    </div>
  </article>;
}

export function DailyGamesBoard({ games, initialAttempts, initialStreak, initialPollResults }: { games: PublicDailyGames; initialAttempts: DailyGameAttempt[]; initialStreak: number; initialPollResults?: DailyPollResults }) {
  const [attempts, setAttempts] = useState(initialAttempts);
  const completed = attempts.length;
  const points = attempts.filter((attempt) => attempt.correct).length;
  const streak = completed === 3 && initialAttempts.length < 3 ? initialStreak + 1 : initialStreak;
  return <><section className="mb-8 grid gap-3 rounded-3xl bg-[var(--primary-dark)] p-5 text-white shadow-lg sm:grid-cols-3 sm:p-6"><div><span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Progreso de hoy</span><strong className="mt-1 block text-3xl">{completed}/3</strong></div><div><span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Puntos ganados</span><strong className="mt-1 block text-3xl text-orange-400">+{points}</strong></div><div><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200"><BsFire className="text-orange-400" /> Racha</span><strong className="mt-1 block text-3xl">{streak} {streak === 1 ? "día" : "días"}</strong></div></section>{completed === 3 && <p className="mb-6 rounded-2xl bg-emerald-50 p-4 text-center font-bold text-emerald-700">Has completado los tres minijuegos de hoy y ganado {points} {points === 1 ? "punto" : "puntos"}.</p>}<div className="grid gap-6 lg:grid-cols-3">{(["trivia", "word", "poll"] as const).map((kind) => <DailyGameCard key={kind} kind={kind} games={games} initialAttempt={attempts.find((attempt) => attempt.kind === kind)} initialPollResults={kind === "poll" ? initialPollResults : undefined} onAttempt={(attempt) => setAttempts((current) => [...current.filter((item) => item.kind !== attempt.kind), attempt])} />)}</div></>;
}
