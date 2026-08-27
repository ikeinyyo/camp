"use client";

import { useEffect, useRef } from "react";
import { BsExclamationCircleFill, BsX } from "react-icons/bs";

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirmar", cancelLabel = "Cancelar", tone = "accent", onConfirm, onClose }: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "accent" | "danger";
  onConfirm: () => void;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return <div role="presentation" className="fixed inset-0 z-[200] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" className="w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white shadow-2xl">
      <div className="flex items-start gap-4 p-5 sm:p-6"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl ${tone === "danger" ? "bg-red-50 text-red-600" : "bg-orange-50 text-[var(--accent)]"}`}><BsExclamationCircleFill /></span><div className="min-w-0 flex-1"><h2 id="confirm-dialog-title" className="text-xl font-black text-slate-950">{title}</h2><p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div><button type="button" onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-lg text-slate-600 hover:bg-slate-200"><BsX /></button></div>
      <div className="grid gap-2 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 sm:p-5"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-100">{cancelLabel}</button><button ref={confirmRef} type="button" onClick={onConfirm} className={`rounded-xl px-4 py-3 font-black text-white ${tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"}`}>{confirmLabel}</button></div>
    </section>
  </div>;
}
