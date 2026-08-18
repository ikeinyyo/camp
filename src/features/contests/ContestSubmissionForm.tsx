import Link from "next/link";
import type { User } from "@/lib/users";
import type { Tapa } from "@/lib/tapas";
import { TapaImageInput } from "@/features/admin/TapaImageInput";

export function ContestSubmissionForm({
  action,
  backHref,
  activeUser,
  users,
  kind,
  item,
}: {
  action: string;
  backHref: string;
  activeUser: User;
  users: User[];
  kind: "tapa" | "actuación";
  item?: Pick<Tapa, "name" | "description" | "participantIds" | "imageUrl">;
}) {
  const input = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-[var(--accent)]";
  const others = users.filter((user) => user.id !== activeUser.id);

  return <form action={action} method="post" encType="multipart/form-data" className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:rounded-3xl sm:p-8">
    <label className="grid gap-2 text-sm font-bold sm:col-span-2">Nombre de {kind === "tapa" ? "la tapa" : "la actuación"}<input name="name" required minLength={2} maxLength={100} defaultValue={item?.name} className={input} /></label>
    <label className="grid gap-2 text-sm font-bold sm:col-span-2">Descripción<textarea name="description" required minLength={5} maxLength={1000} rows={4} defaultValue={item?.description} className={input} /></label>
    {!item && <fieldset className="min-w-0 sm:col-span-2">
      <legend className="text-sm font-bold">Participantes responsables</legend>
      <p className="mt-1 text-xs text-slate-500">Tu usuario está incluido obligatoriamente. Puedes añadir más participantes.</p>
      <div className="mt-3 grid max-h-72 gap-1 overflow-y-auto rounded-2xl border border-slate-200 p-2 sm:grid-cols-2 sm:gap-2 sm:p-3">
        <label className="flex min-h-12 items-center gap-3 rounded-xl bg-[var(--primary-subtle)] px-3 font-bold text-[var(--primary-dark)]">
          <input type="checkbox" checked disabled readOnly className="h-5 w-5 shrink-0 accent-[var(--primary)]" />
          <input type="hidden" name="participantIds" value={activeUser.id} />
          <span className="min-w-0 truncate">{activeUser.displayName} <span className="text-xs font-normal text-slate-500">(tú)</span></span>
        </label>
        {others.map((user) => <label key={user.id} className="flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-slate-50"><input type="checkbox" name="participantIds" value={user.id} className="h-5 w-5 shrink-0 accent-[var(--primary)]" /><span className="min-w-0 truncate">{user.displayName} <span className="text-xs text-slate-500">@{user.username}</span></span></label>)}
      </div>
    </fieldset>}
    {item?.participantIds.map((participantId) => <input key={participantId} type="hidden" name="participantIds" value={participantId} />)}
    <TapaImageInput currentImage={item?.imageUrl} />
    <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-5 sm:col-span-2 sm:flex sm:justify-end"><Link href={backHref} className="grid min-h-12 place-items-center rounded-xl border border-slate-300 px-4 font-bold">Cancelar</Link><button className="min-h-12 rounded-xl bg-[var(--primary)] px-5 font-bold text-white">{item ? "Guardar cambios" : "Publicar"}</button></div>
  </form>;
}
