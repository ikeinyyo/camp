"use client";

import { useState, type DragEvent } from "react";
import { BsChevronDown, BsChevronUp, BsGripVertical } from "react-icons/bs";
import { VOUCHER_CATEGORIES, type VoucherCategory } from "@/config/vouchers";
import type { Voucher } from "@/lib/vouchers";
import type { User } from "@/lib/users";

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]";

export function AdminVoucherLists({ initialVouchers, users }: { initialVouchers: Voucher[]; users: User[] }) {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const usersById = new Map(users.map((user) => [user.id, user]));

  function grouped(category: VoucherCategory) {
    return vouchers.filter((voucher) => voucher.category === category).sort((left, right) => left.sortOrder - right.sortOrder);
  }

  async function save(next: Voucher[]) {
    const normalized = VOUCHER_CATEGORIES.flatMap((category) => next.filter((voucher) => voucher.category === category.id).map((voucher, index) => ({ ...voucher, sortOrder: index + 1 })));
    const previous = vouchers;
    setVouchers(normalized);
    setStatus("Guardando orden…");
    try {
      const response = await fetch("/admin/vouchers/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: normalized.map(({ id, category }) => ({ id, category })) }) });
      if (!response.ok) throw new Error();
      setStatus("Orden guardado");
    } catch {
      setVouchers(previous);
      setStatus("No se pudo guardar el orden");
    }
  }

  function move(id: string, category: VoucherCategory, targetId?: string) {
    const dragged = vouchers.find((voucher) => voucher.id === id);
    if (!dragged || id === targetId) return;
    const ordered = VOUCHER_CATEGORIES.flatMap((item) => grouped(item.id));
    const without = ordered.filter((voucher) => voucher.id !== id);
    const targetIndex = targetId ? without.findIndex((voucher) => voucher.id === targetId) : -1;
    const moved = { ...dragged, category };
    if (targetIndex >= 0) without.splice(targetIndex, 0, moved);
    else {
      const lastCategoryIndex = without.findLastIndex((voucher) => voucher.category === category);
      if (lastCategoryIndex >= 0) without.splice(lastCategoryIndex + 1, 0, moved);
      else {
        const categoryIndex = VOUCHER_CATEGORIES.findIndex((item) => item.id === category);
        const nextCategoryIds = new Set(VOUCHER_CATEGORIES.slice(categoryIndex + 1).map((item) => item.id));
        const nextCategoryIndex = without.findIndex((voucher) => nextCategoryIds.has(voucher.category));
        without.splice(nextCategoryIndex < 0 ? without.length : nextCategoryIndex, 0, moved);
      }
    }
    void save(without);
  }

  function moveBy(id: string, direction: -1 | 1) {
    const voucher = vouchers.find((item) => item.id === id);
    if (!voucher) return;
    const list = grouped(voucher.category);
    const index = list.findIndex((item) => item.id === id);
    const target = list[index + direction];
    if (!target) return;
    const ordered = VOUCHER_CATEGORIES.flatMap((item) => grouped(item.id));
    const currentIndex = ordered.findIndex((item) => item.id === voucher.id);
    const targetIndex = ordered.findIndex((item) => item.id === target.id);
    [ordered[currentIndex], ordered[targetIndex]] = [ordered[targetIndex], ordered[currentIndex]];
    void save(ordered);
  }

  function drop(event: DragEvent, category: VoucherCategory, targetId?: string) {
    event.preventDefault();
    const id = draggedId ?? event.dataTransfer.getData("text/plain");
    setDraggedId(null);
    if (id) move(id, category, targetId);
  }

  return <section className="min-w-0">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black">Catálogo de vales</h2><p className="mt-1 text-sm text-slate-600">Arrastra los vales para ordenarlos o moverlos a otra categoría.</p></div><p aria-live="polite" className="text-sm font-bold text-[var(--primary)]">{status}</p></div>
    <div className="mt-5 grid min-w-0 items-start gap-5 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
      {VOUCHER_CATEGORIES.map((category) => {
        const items = grouped(category.id);
        return <div key={category.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, category.id)} className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <h3 className="text-lg font-black text-[var(--primary-dark)]">{category.name}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-slate-600">{category.description}</p>
          <div className="mt-4 grid min-h-20 min-w-0 gap-3">
            {items.map((voucher, index) => <article key={voucher.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.stopPropagation(); drop(event, category.id, voucher.id); }} className={`w-full min-w-0 max-w-full overflow-hidden rounded-xl border bg-white shadow-sm ${draggedId === voucher.id ? "opacity-50" : ""}`}>
              <details className="w-full min-w-0 max-w-full overflow-hidden">
                <summary className="flex min-w-0 max-w-full cursor-pointer list-none items-center gap-2 overflow-hidden p-3">
                  <span draggable onDragStart={(event) => { setDraggedId(voucher.id); event.dataTransfer.setData("text/plain", voucher.id); event.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => setDraggedId(null)} title="Arrastrar vale" className="cursor-grab touch-none text-xl text-slate-400 active:cursor-grabbing"><BsGripVertical /></span>
                  <span className="min-w-0 flex-1 overflow-hidden"><strong className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm">{voucher.title}</strong><span className="block truncate text-xs text-slate-500">{voucher.points > 0 ? "+" : ""}{voucher.points} puntos · {voucher.active ? "Activo" : "Inactivo"} · {voucher.maxReservations === null ? "Ilimitado" : `${voucher.reservedUserIds.length}/${voucher.maxReservations} plazas`}</span>{voucher.maxReservations !== null && voucher.reservedUserIds.length > 0 && <span className="mt-0.5 block truncate text-[11px] font-semibold text-[var(--primary)]">Reservado por {voucher.reservedUserIds.map((id) => usersById.get(id)?.displayName).filter(Boolean).join(", ")}</span>}</span>
                  <span className="flex shrink-0 gap-1"><button type="button" disabled={index === 0} onClick={(event) => { event.preventDefault(); moveBy(voucher.id, -1); }} aria-label="Subir vale" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-30"><BsChevronUp /></button><button type="button" disabled={index === items.length - 1} onClick={(event) => { event.preventDefault(); moveBy(voucher.id, 1); }} aria-label="Bajar vale" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-30"><BsChevronDown /></button></span>
                </summary>
                <div className="border-t border-slate-100 p-3">
                  <form action={`/admin/vouchers/${voucher.id}`} method="post" className="grid gap-3">
                    <input type="hidden" name="sortOrder" value={voucher.sortOrder} /><input type="hidden" name="category" value={voucher.category} />
                    <label className="grid gap-1 text-xs font-bold">Título<input name="title" defaultValue={voucher.title} required minLength={3} maxLength={80} className={inputClass} /></label>
                    <label className="grid gap-1 text-xs font-bold">Descripción<textarea name="description" defaultValue={voucher.description} required minLength={5} maxLength={500} rows={3} className={`${inputClass} resize-none`} /></label>
                    <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs font-bold">Puntos<input name="points" type="number" min={-100} max={100} defaultValue={voucher.points} required className={inputClass} /></label><label className="grid gap-1 text-xs font-bold">Estado<select name="active" defaultValue={String(voucher.active)} className={inputClass}><option value="true">Activo</option><option value="false">Inactivo</option></select></label></div>
                    <label className="grid gap-1 text-xs font-bold">Máximo de plazas <span className="font-normal text-slate-500">Déjalo vacío para que sea ilimitado</span><input name="maxReservations" type="number" min={1} defaultValue={voucher.maxReservations ?? ""} placeholder="Ilimitadas" className={inputClass} /></label>
                    <fieldset className="min-w-0"><legend className="text-xs font-bold">Personas apuntadas</legend><p className="mt-1 text-[11px] text-slate-500">Solo se aplica a los vales con plazas limitadas. Desde aquí puedes añadir o quitar personas.</p><div className="mt-2 grid max-h-48 gap-1 overflow-y-auto rounded-xl border border-slate-200 p-2">{users.map((user) => <label key={user.id} className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"><input type="checkbox" name="reservedUserIds" value={user.id} defaultChecked={voucher.reservedUserIds.includes(user.id)} className="h-4 w-4 shrink-0 accent-[var(--primary)]" /><span className="min-w-0 truncate text-xs font-semibold">{user.displayName} <span className="font-normal text-slate-500">@{user.username}</span></span></label>)}</div></fieldset>
                    <button className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-bold text-white">Guardar cambios</button>
                  </form>
                  <form action={`/admin/vouchers/${voucher.id}/delete`} method="post" className="mt-2"><button className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">Borrar vale</button></form>
                </div>
              </details>
            </article>)}
            {items.length === 0 && <p className="grid min-h-20 place-items-center rounded-xl border-2 border-dashed border-slate-200 px-4 text-center text-sm text-slate-400">Arrastra aquí un vale</p>}
          </div>
        </div>;
      })}
    </div>
  </section>;
}
