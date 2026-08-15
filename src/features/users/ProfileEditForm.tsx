import type { User } from "@/lib/users";
import { TapaImageInput } from "@/features/admin/TapaImageInput";

export function ProfileEditForm({ user }: { user: User }) {
  const input = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--accent)]";
  return <form action="/perfil/guardar" method="post" encType="multipart/form-data" className="flex w-full flex-col gap-5 text-left text-slate-900">
    <label className="flex w-full min-w-0 flex-col gap-2 text-sm font-bold"><span>Nombre visible</span><span className="min-h-5 font-normal text-slate-500">Tu nombre o apodo</span><input name="displayName" required minLength={2} maxLength={80} defaultValue={user.displayName} className={`${input} h-14`} /></label>
    <label className="flex w-full min-w-0 flex-col gap-2 text-sm font-bold"><span>Estado</span><span className="min-h-5 font-normal text-slate-500">Un mensaje breve para la familia</span><textarea name="status" maxLength={120} rows={3} defaultValue={user.status} placeholder="Ej. Preparado para ganar el concurso de tapas" className={`${input} h-28 resize-none`} /></label>
    <TapaImageInput currentImage={user.avatarUrl} />
    <button className="min-h-12 rounded-xl bg-[var(--primary)] px-5 font-bold text-white sm:justify-self-start">Guardar perfil</button>
  </form>;
}
