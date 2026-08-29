/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ProfileParticipation } from "@/lib/profile-participations";

export function ProfileParticipations({ participations }: { participations: ProfileParticipation[] }) {
  return (
    <section className="mx-auto mt-8 max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black">Participaciones</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">Las propuestas y equipos con los que forma parte de la Gallardo Camp.</p>
      {participations.length > 0 ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {participations.map((item) => <Link key={item.id} href={item.href} className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:border-[var(--primary-border)] hover:shadow-md">
          {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-32 w-full object-cover" /> : <div className="grid h-32 place-items-center bg-gradient-to-br from-emerald-900 to-emerald-700 text-6xl text-white" aria-hidden="true">🁣</div>}
          <div className="p-4"><span className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--accent)]">{item.label}</span><h3 className="mt-1 text-lg font-black text-slate-900 group-hover:text-[var(--primary)]">{item.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p></div>
        </Link>)}
      </div> : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><span className="text-3xl" aria-hidden="true">🎪</span><strong className="mt-2 block text-slate-700">Todavía no hay participaciones</strong><span className="mt-1 block text-sm text-slate-500">Las tapas, actuaciones y parejas de dominó aparecerán aquí.</span></div>}
    </section>
  );
}
