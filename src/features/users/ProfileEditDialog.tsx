"use client";

import { useEffect, useState } from "react";
import { BsGearFill, BsX } from "react-icons/bs";
import type { User } from "@/lib/users";
import { ProfileEditForm } from "./ProfileEditForm";

export function ProfileEditDialog({ user, openInitially = false }: { user: User; openInitially?: boolean }) {
  const [open, setOpen] = useState(openInitially);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="Editar mi perfil" title="Editar mi perfil" className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-white/10 text-xl text-white shadow-lg backdrop-blur transition hover:bg-white/20">
      <BsGearFill />
    </button>
    {open && <div className="fixed inset-0 z-[100] grid place-items-end bg-slate-950/70 sm:place-items-center sm:p-4" onClick={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="profile-edit-title" className="max-h-[94dvh] w-full max-w-xl overflow-hidden rounded-t-3xl bg-white text-left text-slate-900 shadow-2xl sm:rounded-3xl">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">Mi perfil</p><h2 id="profile-edit-title" className="mt-1 text-2xl font-black">Editar perfil</h2></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar edición" className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-2xl text-slate-700"><BsX /></button>
        </header>
        <div className="max-h-[calc(94dvh-5rem)] overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
          <ProfileEditForm user={user} />
        </div>
      </section>
    </div>}
  </>;
}
