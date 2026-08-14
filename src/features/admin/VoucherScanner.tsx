"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import {
  BsCamera,
  BsCheckCircleFill,
  BsChevronDown,
  BsExclamationTriangleFill,
  BsQrCodeScan,
  BsX,
} from "react-icons/bs";

function getClaim(rawValue: string) {
  try {
    const payload = JSON.parse(rawValue) as { type?: string; claimId?: string };
    return payload.claimId && (payload.type === "gallardo-camp-voucher" || payload.type === "gallardo-camp-activity") ? payload : null;
  } catch {
    return null;
  }
}

export function VoucherScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const scanAttemptRef = useRef(0);
  const [scanning, setScanning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<{
    alreadyRedeemed: boolean;
    points: number;
    displayName: string;
  } | null>(null);
  const [error, setError] = useState("");

  function stopScanner() {
    scanAttemptRef.current += 1;
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }

  useEffect(() => stopScanner, []);

  useEffect(() => {
    document.body.style.overflow = scanning ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [scanning]);

  async function redeem(rawValue: string) {
    const claim = getClaim(rawValue);
    if (!claim) {
      setError("El código no corresponde a un vale de Gallardo Camp.");
      stopScanner();
      return;
    }
    setError("");
    setValidating(true);
    try {
      const response = await fetch("/admin/validation/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(claim) });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No se pudo validar el vale.");
        stopScanner();
        return;
      }
      stopScanner();
      setResult(data);
      setManualCode("");
    } finally {
      setValidating(false);
    }
  }

  async function startScanner() {
    setError("");
    setResult(null);
    setScanning(true);
    const attempt = ++scanAttemptRef.current;
    window.requestAnimationFrame(() => {
      void connectCamera(attempt);
    });
  }

  async function connectCamera(attempt: number) {
    try {
      if (!videoRef.current) {
        throw new Error("No se pudo iniciar el visor.");
      }
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        videoRef.current,
        (result, _error, controls) => {
          if (result) {
            controls.stop();
            void redeem(result.getText());
          }
        },
      );
      if (attempt !== scanAttemptRef.current) {
        controls.stop();
        return;
      }
      controlsRef.current = controls;
    } catch {
      setError("No se pudo acceder a la cámara. Revisa los permisos del navegador.");
      stopScanner();
    }
  }

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-3xl border border-[var(--primary-border)] bg-white shadow-[0_10px_35px_rgb(15_23_42/0.08)]">
      <div className="bg-[var(--primary-dark)] p-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl text-orange-400">
            <BsQrCodeScan aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-black sm:text-2xl">Validar un QR</h2>
            <p className="mt-1 text-sm leading-6 text-emerald-100/80">Apunta al vale del participante y aplicaremos sus puntos.</p>
          </div>
        </div>
        <button type="button" onClick={startScanner} className="mt-5 inline-flex min-h-14 max-w-full items-center justify-center gap-3 self-stretch rounded-2xl bg-[var(--accent)] px-5 py-3 text-base font-black text-white shadow-lg shadow-black/20 transition active:scale-[0.98] hover:bg-[var(--accent-hover)] sm:mt-0 sm:self-auto sm:px-6">
          <BsCamera aria-hidden="true" className="text-xl" /> Escanear vale
        </button>
      </div>

      <div className="p-5 sm:p-7">
        {result && (
          <div role="status" className={`rounded-2xl p-5 text-center ${result.alreadyRedeemed ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>
            {result.alreadyRedeemed ? <BsExclamationTriangleFill aria-hidden="true" className="mx-auto text-3xl" /> : <BsCheckCircleFill aria-hidden="true" className="mx-auto text-4xl" />}
            <p className="mt-3 text-lg font-black">{result.alreadyRedeemed ? "Vale ya canjeado" : "¡Vale validado!"}</p>
            <p className="mt-1 text-sm font-semibold">{result.alreadyRedeemed ? "Este código ya se había utilizado anteriormente." : `+${result.points} puntos para ${result.displayName}`}</p>
            <button type="button" onClick={startScanner} className="mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-bold shadow-sm">Escanear otro vale</button>
          </div>
        )}

        {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}

        <details className="group mt-5 border-t border-slate-200 pt-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-slate-600 [&::-webkit-details-marker]:hidden">
            Introducir código manualmente
            <BsChevronDown aria-hidden="true" className="transition group-open:rotate-180" />
          </summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="voucher-code">Contenido o identificador del QR</label>
            <input id="voucher-code" value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="Pegar el contenido del QR" className="min-h-12 min-w-0 rounded-xl border border-slate-300 px-4 py-2.5 text-base outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />
            <button type="button" disabled={validating || !manualCode.trim()} onClick={() => redeem(manualCode)} className="min-h-12 rounded-xl border border-[var(--primary)] px-5 py-2.5 text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary-subtle)] disabled:opacity-50">Validar código</button>
          </div>
        </details>
      </div>

      {scanning && <div className="fixed inset-0 z-[100] bg-black">
        <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.65),transparent_25%,transparent_70%,rgba(0,0,0,.8))]" />
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
          <div><p className="text-lg font-black">Escanear vale</p><p className="text-xs text-white/70">Gallardo Camp</p></div>
          <button type="button" onClick={stopScanner} aria-label="Cerrar escáner" className="grid h-12 w-12 place-items-center rounded-full bg-black/40 text-3xl backdrop-blur"><BsX aria-hidden="true" /></button>
        </div>
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-8">
          <div className={`relative aspect-square w-full max-w-xs rounded-[2rem] border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.28)] ${validating ? "opacity-40" : ""}`}>
            <span className="absolute -left-1 -top-1 h-14 w-14 rounded-tl-[2rem] border-l-4 border-t-4 border-orange-400" />
            <span className="absolute -right-1 -top-1 h-14 w-14 rounded-tr-[2rem] border-r-4 border-t-4 border-orange-400" />
            <span className="absolute -bottom-1 -left-1 h-14 w-14 rounded-bl-[2rem] border-b-4 border-l-4 border-orange-400" />
            <span className="absolute -bottom-1 -right-1 h-14 w-14 rounded-br-[2rem] border-b-4 border-r-4 border-orange-400" />
          </div>
          {validating && (
            <div className="absolute rounded-2xl bg-black/75 px-6 py-4 text-center text-white backdrop-blur">
              <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-orange-400" />
              <span className="mt-3 block font-bold">Validando vale…</span>
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] text-center text-white">
          <p className="font-bold">Coloca el código QR dentro del recuadro</p>
          <p className="mt-1 text-sm text-white/70">Se validará automáticamente al detectarlo.</p>
        </div>
      </div>}
    </section>
  );
}
