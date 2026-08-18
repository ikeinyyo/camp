"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BsCheck2Circle, BsTicketPerforated, BsX } from "react-icons/bs";
import type { Voucher, VoucherClaim } from "@/lib/vouchers";

type ClaimResponse = { claim: VoucherClaim; qrCode: string; payload: string };

export function VoucherCatalog({ vouchers, displayName, previewOnly = false }: { vouchers: Voucher[]; displayName: string; previewOnly?: boolean }) {
  const requestIdRef = useRef(0);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [claim, setClaim] = useState<ClaimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function openVoucher(voucher: Voucher) {
    const requestId = ++requestIdRef.current;
    setSelectedVoucher(voucher);
    setClaim(null);
    if (previewOnly) {
      setLoading(false);
      setError("");
      return;
    }
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

  function close() {
    requestIdRef.current += 1;
    setSelectedVoucher(null);
    setClaim(null);
    setError("");
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {vouchers.map((voucher) => (
          <button key={voucher.id} type="button" onClick={() => openVoucher(voucher)} className="group touch-manipulation rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition sm:hover:-translate-y-1 sm:hover:border-[var(--accent)] sm:hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--primary-subtle)] text-2xl text-[var(--primary)]"><BsTicketPerforated aria-hidden="true" /></span>
              <span className="rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-sm font-black text-[var(--accent-hover)]">+{voucher.points} pts</span>
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-900">{voucher.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{voucher.description}</p>
            <span className="mt-5 inline-block text-sm font-bold text-[var(--primary)]">Ver vale →</span>
          </button>
        ))}
      </div>

      {selectedVoucher && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/65 sm:place-items-center sm:p-4 sm:backdrop-blur-sm" role="presentation" onClick={(event) => event.target === event.currentTarget && close()}>
          <section role="dialog" aria-modal="true" aria-labelledby="voucher-title" className="relative max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-8">
            <button type="button" onClick={close} aria-label="Cerrar detalle" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-2xl text-slate-500 hover:bg-slate-100"><BsX aria-hidden="true" /></button>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--accent)]">Vale de {displayName}</p>
            <h2 id="voucher-title" className="mt-3 pr-10 text-3xl font-black">{selectedVoucher.title}</h2>
            <p className="mt-4 leading-7 text-slate-600">{selectedVoucher.description}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-4 py-2 font-black text-[var(--accent-hover)]"><BsCheck2Circle aria-hidden="true" /> {selectedVoucher.points} puntos al validarlo</div>

            {previewOnly ? (
              <div className="mt-7 rounded-2xl bg-[var(--primary-subtle)] p-5 text-center font-bold text-[var(--primary-dark)]">Este vale estará disponible cuando empiece la Gallardo Camp.</div>
            ) : !claim ? (
              <div className="mt-7 rounded-2xl bg-slate-50 p-8 text-center font-bold text-slate-600">{loading ? "Generando QR…" : "No se pudo generar el QR."}</div>
            ) : (
              <div className="mt-7 text-center">
                <Image src={claim.qrCode} alt={`QR del vale ${claim.claim.voucherTitle}`} width={420} height={420} unoptimized className="mx-auto h-auto w-full max-w-72" />
                <p className="mt-3 text-sm font-bold text-[var(--primary-dark)]">Enséñame este QR para validar la tarea.</p>
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
