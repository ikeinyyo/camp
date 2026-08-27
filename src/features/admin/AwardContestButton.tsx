"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/features/ui/ConfirmDialog";

export function AwardContestButton({ action, disabled, pending }: { action: string; disabled: boolean; pending: number }) {
  const [confirming, setConfirming] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  return <><form ref={formRef} action={action} method="post" onSubmit={(event) => { event.preventDefault(); setConfirming(true); }}>
      <button disabled={disabled} className="w-full rounded-xl bg-[var(--accent)] px-5 py-3 font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{pending > 0 ? "Asignar estos puntos" : "Puntos ya asignados"}</button>
    </form><ConfirmDialog open={confirming} title="Asignar puntos del podio" description={`Se asignarán los premios a ${pending} participante${pending === 1 ? "" : "s"}. Esta acción quedará registrada en sus perfiles.`} confirmLabel="Asignar puntos" onClose={() => setConfirming(false)} onConfirm={() => formRef.current?.submit()} /></>;
}
