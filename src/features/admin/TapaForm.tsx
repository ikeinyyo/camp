import type { ReactNode } from "react";
import type { Tapa } from "@/lib/tapas";
import type { User } from "@/lib/users";
import { TapaImageInput } from "./TapaImageInput";

export function TapaForm({ action, users, tapa, children }: { action: string; users: User[]; tapa?: Tapa; children?: ReactNode }) {
  const input = "rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[var(--accent)]";
  return <form action={action} method="post" encType="multipart/form-data" className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:rounded-3xl sm:p-8">
    <label className="grid gap-2 text-sm font-bold sm:col-span-2">Nombre<input name="name" required minLength={2} maxLength={100} defaultValue={tapa?.name} className={input} /></label>
    <label className="grid gap-2 text-sm font-bold sm:col-span-2">Descripción<textarea name="description" required minLength={5} maxLength={1000} rows={4} defaultValue={tapa?.description} className={input} /></label>
    <fieldset className="min-w-0 sm:col-span-2"><legend className="text-sm font-bold">Participantes responsables</legend><p className="mt-1 text-xs text-slate-500">Puedes seleccionar uno o varios.</p><div className="mt-3 grid max-h-64 gap-1 overflow-y-auto rounded-2xl border border-slate-200 p-2 sm:max-h-80 sm:grid-cols-2 sm:gap-2 sm:p-3">{users.map((user) => <label key={user.id} className="flex min-h-11 items-center gap-3 rounded-xl px-3 hover:bg-slate-50"><input type="checkbox" name="participantIds" value={user.id} defaultChecked={tapa?.participantIds.includes(user.id)} className="h-5 w-5 shrink-0 accent-[var(--primary)]" /><span className="min-w-0 truncate">{user.displayName} <span className="text-xs text-slate-500">@{user.username}</span></span></label>)}</div></fieldset>
    <TapaImageInput currentImage={tapa?.imageUrl} />
    {tapa && <label className="grid gap-2 text-sm font-bold">Estado<select name="active" defaultValue={String(tapa.active)} className={input}><option value="true">Activa</option><option value="false">Inactiva</option></select></label>}
    <div className="sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-20 -mx-4 -mb-4 flex justify-end gap-3 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-6px_16px_rgb(15_23_42/0.08)] backdrop-blur sm:static sm:mx-0 sm:mb-0 sm:col-span-2 sm:bg-transparent sm:p-0 sm:pt-5 sm:shadow-none">{children}<button className="min-h-11 flex-1 rounded-xl bg-[var(--primary)] px-5 py-2.5 font-bold text-white sm:min-h-12 sm:flex-none sm:py-3">Guardar tapa</button></div>
  </form>;
}
