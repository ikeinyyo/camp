"use client";

export function AwardContestButton({ action, disabled, pending }: { action: string; disabled: boolean; pending: number }) {
  return <form action={action} method="post" onSubmit={(event) => {
    if (!window.confirm(`Se asignarán los premios a ${pending} participante${pending === 1 ? "" : "s"}. ¿Continuar?`)) event.preventDefault();
  }}>
    <button disabled={disabled} className="w-full rounded-xl bg-[var(--accent)] px-5 py-3 font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">
      {pending > 0 ? "Asignar estos puntos" : "Puntos ya asignados"}
    </button>
  </form>;
}
