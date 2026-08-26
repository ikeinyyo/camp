import { BsCheckCircleFill, BsTrophyFill } from "react-icons/bs";
import { UserAvatar } from "@/features/users/UserAvatar";
import type { ContestAwardsPreview } from "@/lib/contest-awards";
import { AwardContestButton } from "./AwardContestButton";

export function ContestAwardsPanel({ preview, action }: { preview: ContestAwardsPreview; action: string }) {
  const pending = preview.awards.filter((award) => !award.alreadyAwarded).length;

  return <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-xl text-amber-600"><BsTrophyFill /></span><div><h2 className="text-xl font-black sm:text-2xl">Reparto de puntos</h2><p className="mt-1 text-sm text-slate-600">Revisa el premio que recibirá cada participante antes de confirmarlo.</p></div></div>
    {preview.awards.length > 0 ? <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
      <div className="divide-y divide-slate-200">{preview.awards.map((award) => <div key={`${award.key}-${award.user.id}`} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-3"><UserAvatar user={award.user} className="h-10 w-10 shrink-0" textClassName="text-sm" /><div className="min-w-0"><p className="truncate font-black">{award.user.displayName}</p><p className="truncate text-xs text-slate-500">{award.position}.º · {award.entryName}</p></div></div>
        <div className="text-right"><p className="font-black text-[var(--primary)]">+{award.points} puntos</p><p className={`mt-0.5 text-xs font-bold ${award.alreadyAwarded ? "text-emerald-700" : "text-slate-500"}`}>{award.alreadyAwarded && <BsCheckCircleFill className="mr-1 inline" />}{award.alreadyAwarded ? "Asignados" : "Pendientes"}</p></div>
      </div>)}</div>
    </div> : <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Aún no hay un podio disponible.</p>}
    {!preview.ready && preview.reason && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">{preview.reason}</p>}
    <div className="mt-4"><AwardContestButton action={action} pending={pending} disabled={!preview.ready || pending === 0} /></div>
  </section>;
}
