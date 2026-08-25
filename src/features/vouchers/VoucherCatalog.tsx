"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BsCheck2Circle, BsPeople, BsTicketPerforated, BsX } from "react-icons/bs";
import { VOUCHER_CATEGORIES } from "@/config/vouchers";
import { UserAvatar } from "@/features/users/UserAvatar";
import type { Voucher, VoucherClaim } from "@/lib/vouchers";
import type { User } from "@/lib/users";

type ClaimResponse = { claim: VoucherClaim; qrCode: string; payload: string };

export function VoucherCatalog({ vouchers: initialVouchers, activeUser, users, redeemedVoucherIds, previewOnly = false }: { vouchers: Voucher[]; activeUser: User; users: User[]; redeemedVoucherIds: string[]; previewOnly?: boolean }) {
  const activeUserId = activeUser.id;
  const requestIdRef = useRef(0);
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [claim, setClaim] = useState<ClaimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmingReservation, setConfirmingReservation] = useState(false);
  const [reservationMessage, setReservationMessage] = useState("");
  const usersById = new Map(users.map((user) => [user.id, user]));
  const reservedVouchers = vouchers.filter((voucher) => voucher.reservedUserIds.includes(activeUserId));
  const voucherGroups = [
    ...(reservedVouchers.length > 0 ? [{ id: "reserved", name: "Tus vales reservados", description: "Tus plazas confirmadas aparecen primero para que puedas encontrarlas rápidamente.", vouchers: reservedVouchers }] : []),
    ...VOUCHER_CATEGORIES.map((category) => ({ ...category, vouchers: vouchers.filter((voucher) => voucher.category === category.id && !voucher.reservedUserIds.includes(activeUserId)) })),
  ];

  useEffect(() => {
    if (!selectedVoucher) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelectedVoucher(null);
    document.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", close);
    };
  }, [selectedVoucher]);

  async function generateClaim(voucher: Voucher) {
    const requestId = ++requestIdRef.current;
    setClaim(null);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/voucher-claims", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voucherId: voucher.id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (requestId === requestIdRef.current) setClaim(data);
    } catch (caughtError) {
      if (requestId === requestIdRef.current) setError(caughtError instanceof Error ? caughtError.message : "No se pudo generar el QR.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  function openVoucher(voucher: Voucher) {
    requestIdRef.current += 1;
    setSelectedVoucher(voucher);
    setClaim(null);
    setLoading(false);
    setError("");
    setConfirmingReservation(false);
    setReservationMessage("");
    if (!previewOnly && (voucher.maxReservations === null || voucher.reservedUserIds.includes(activeUserId))) void generateClaim(voucher);
  }

  async function reserve() {
    if (!selectedVoucher) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/vouchers/${selectedVoucher.id}/reserve`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const updated = data.voucher as Voucher;
      setVouchers((current) => current.map((voucher) => voucher.id === updated.id ? updated : voucher));
      setSelectedVoucher(updated);
      setConfirmingReservation(false);
      setReservationMessage("Tu plaza se ha reservado correctamente. Solo el administrador puede cancelar esta reserva.");
      if (previewOnly) setLoading(false);
      else await generateClaim(updated);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo reservar la plaza.");
      setLoading(false);
    }
  }

  function close() {
    requestIdRef.current += 1;
    setSelectedVoucher(null);
    setClaim(null);
    setError("");
    setConfirmingReservation(false);
    setReservationMessage("");
  }

  return (
    <>
      <div className="grid gap-12">
        {voucherGroups.map((category) => {
          const categoryVouchers = category.vouchers;
          if (categoryVouchers.length === 0) return null;
          return <section key={category.id}>
            <div className="mb-5 border-l-4 border-[var(--accent)] pl-4"><h2 className="text-2xl font-black text-[var(--primary-dark)]">{category.name}</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{category.description}</p></div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categoryVouchers.map((voucher) => (
                <button key={voucher.id} type="button" disabled={voucher.maxReservations !== null && redeemedVoucherIds.includes(voucher.id)} onClick={() => openVoucher(voucher)} className="group touch-manipulation rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition enabled:sm:hover:-translate-y-1 enabled:sm:hover:border-[var(--accent)] enabled:sm:hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-65">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--primary-subtle)] text-2xl text-[var(--primary)]"><BsTicketPerforated aria-hidden="true" /></span>
                    <span className={`rounded-full px-3 py-1 text-sm font-black ${voucher.points < 0 ? "bg-red-50 text-red-700" : "bg-[var(--accent-subtle)] text-[var(--accent-hover)]"}`}>{voucher.points > 0 ? "+" : ""}{voucher.points} pts</span>
                  </div>
                  <h3 className="mt-5 text-xl font-black text-slate-900">{voucher.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{voucher.description}</p>
                  {voucher.maxReservations !== null && <span className={`mt-4 flex items-center gap-2 text-sm font-bold ${voucher.reservedUserIds.length >= voucher.maxReservations && !voucher.reservedUserIds.includes(activeUserId) ? "text-red-600" : "text-[var(--accent)]"}`}><BsPeople /> {voucher.reservedUserIds.includes(activeUserId) ? "Tienes plaza" : voucher.reservedUserIds.length >= voucher.maxReservations ? "Completo" : `${voucher.maxReservations - voucher.reservedUserIds.length} ${voucher.maxReservations - voucher.reservedUserIds.length === 1 ? "plaza libre" : "plazas libres"}`}</span>}
                  {voucher.maxReservations !== null && voucher.reservedUserIds.length > 0 && <span className="mt-3 block truncate text-xs font-semibold text-slate-500">Reservado por {voucher.reservedUserIds.map((id) => usersById.get(id)?.displayName).filter(Boolean).join(", ")}</span>}
                  {voucher.maxReservations !== null && redeemedVoucherIds.includes(voucher.id) ? <span className="mt-5 inline-flex rounded-full bg-slate-200 px-3 py-1.5 text-sm font-black text-slate-600">Ya reclamado</span> : <span className="mt-5 inline-block text-sm font-bold text-[var(--primary)]">Ver vale →</span>}
                </button>
              ))}
            </div>
          </section>;
        })}
      </div>

      {selectedVoucher && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/65 sm:place-items-center sm:p-4 sm:backdrop-blur-sm" role="presentation" onClick={(event) => event.target === event.currentTarget && close()}>
          <section role="dialog" aria-modal="true" aria-labelledby="voucher-title" className="relative max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-8">
            <button type="button" onClick={close} aria-label="Cerrar detalle" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-2xl text-slate-500 hover:bg-slate-100"><BsX aria-hidden="true" /></button>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--accent)]">Vale</p>
            <h2 id="voucher-title" className="mt-3 pr-10 text-3xl font-black">{selectedVoucher.title}</h2>
            <p className="mt-4 leading-7 text-slate-600">{selectedVoucher.description}</p>
            <div className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 font-black ${selectedVoucher.points < 0 ? "bg-red-50 text-red-700" : "bg-[var(--accent-subtle)] text-[var(--accent-hover)]"}`}><BsCheck2Circle aria-hidden="true" /> {selectedVoucher.points > 0 ? "+" : ""}{selectedVoucher.points} puntos al validarlo</div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[var(--primary-border)] bg-[var(--primary-subtle)] p-4 text-left"><UserAvatar user={activeUser} className="h-12 w-12" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">QR generado para</p><p className="truncate text-lg font-black text-[var(--primary-dark)]">{activeUser.displayName}</p><p className="truncate text-sm text-slate-500">@{activeUser.username}</p></div></div>
            {selectedVoucher.maxReservations !== null && <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700"><BsPeople className="shrink-0 text-xl text-[var(--primary)]" /> {selectedVoucher.reservedUserIds.includes(activeUserId) ? "Tienes una plaza reservada" : selectedVoucher.reservedUserIds.length >= selectedVoucher.maxReservations ? "No quedan plazas disponibles" : `${selectedVoucher.maxReservations - selectedVoucher.reservedUserIds.length} de ${selectedVoucher.maxReservations} plazas disponibles`}</div>}
            {selectedVoucher.maxReservations !== null && selectedVoucher.reservedUserIds.length > 0 && <div className="mt-3 rounded-2xl border border-slate-200 p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Plazas reservadas</p><div className="mt-3 flex flex-wrap gap-2">{selectedVoucher.reservedUserIds.map((id) => usersById.get(id)).filter((user): user is User => Boolean(user)).map((user) => <span key={user.id} className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-subtle)] py-1.5 pl-1.5 pr-3 text-sm font-bold text-[var(--primary-dark)]"><UserAvatar user={user} className="h-7 w-7" textClassName="text-xs" />{user.displayName}</span>)}</div></div>}
            {reservationMessage && <p role="status" className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-700">{reservationMessage}</p>}

            {selectedVoucher.maxReservations !== null && !selectedVoucher.reservedUserIds.includes(activeUserId) ? (
              selectedVoucher.reservedUserIds.length >= selectedVoucher.maxReservations ? <div className="mt-7 rounded-2xl bg-red-50 p-5 text-center font-bold text-red-700">Este vale está completo.</div> : confirmingReservation ? <div className="mt-7 rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent-subtle)] p-5"><h3 className="text-lg font-black text-[var(--primary-dark)]">¿Confirmas tu reserva?</h3><p className="mt-2 text-sm leading-6 text-slate-700">Vas a ocupar una de las plazas de este vale. Después no podrás quitarte tú mismo; si cambias de idea tendrás que avisar al administrador.</p><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => setConfirmingReservation(false)} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-bold">Cancelar</button><button type="button" onClick={() => void reserve()} disabled={loading} className="min-h-12 rounded-xl bg-[var(--accent)] px-4 font-black text-white disabled:opacity-60">{loading ? "Reservando…" : "Sí, reservar"}</button></div></div> : <button type="button" onClick={() => setConfirmingReservation(true)} className="mt-7 min-h-12 w-full rounded-xl bg-[var(--primary)] px-5 font-black text-white">Reservar mi plaza</button>
            ) : previewOnly ? (
              <div className="mt-7 rounded-2xl bg-[var(--primary-subtle)] p-5 text-center font-bold text-[var(--primary-dark)]">{selectedVoucher.maxReservations !== null ? "Tu plaza está reservada. El QR estará disponible cuando empiece la Gallardo Camp." : "Este vale estará disponible cuando empiece la Gallardo Camp."}</div>
            ) : !claim ? (
              <div className="mt-7 rounded-2xl bg-slate-50 p-8 text-center font-bold text-slate-600">{loading ? "Generando QR…" : "No se pudo generar el QR."}</div>
            ) : (
              <div className="mt-7 text-center">
                <Image src={claim.qrCode} alt={`QR del vale ${claim.claim.voucherTitle} de ${activeUser.displayName}`} width={420} height={420} unoptimized className="mx-auto h-auto w-full max-w-72" />
                <p className="mt-3 text-sm font-bold text-[var(--primary-dark)]">Enséñame este QR para validar el vale de {activeUser.displayName}.</p>
                <p className="mt-1 text-xs text-slate-500">Solo se puede canjear una vez.</p>
              </div>
            )}
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          </section>
        </div>
      )}
    </>
  );
}
