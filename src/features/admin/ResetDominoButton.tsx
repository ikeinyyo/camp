"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/features/ui/ConfirmDialog";

export function ResetDominoButton() {
  const [confirming, setConfirming] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  return <><form ref={formRef} action="/admin/domino/reset" method="post" onSubmit={(event) => { event.preventDefault(); setConfirming(true); }}><button className="w-full rounded-xl border border-red-300 bg-white px-5 py-3 font-black text-red-700 transition hover:bg-red-50">Reiniciar campeonato</button></form><ConfirmDialog open={confirming} tone="danger" title="Reiniciar campeonato" description="Se eliminarán las parejas, las rondas y todos sus resultados. Las inscripciones se conservarán." confirmLabel="Sí, reiniciar" onClose={() => setConfirming(false)} onConfirm={() => formRef.current?.submit()} /></>;
}
