/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { BsCamera, BsImage, BsX } from "react-icons/bs";

async function squareImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas"); canvas.width = 900; canvas.height = 900;
  const context = canvas.getContext("2d"); if (!context) throw new Error("No se pudo procesar la imagen.");
  context.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 900, 900);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("No se pudo recortar.")), "image/jpeg", 0.86));
  return new File([blob], "tapa.jpg", { type: "image/jpeg" });
}

export function TapaImageInput({ required = false, currentImage }: { required?: boolean; currentImage?: string }) {
  const fileRef = useRef<HTMLInputElement>(null); const videoRef = useRef<HTMLVideoElement>(null); const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState(currentImage ?? ""); const [camera, setCamera] = useState(false);
  function stop() { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; setCamera(false); }
  useEffect(() => stop, []);

  async function setFile(file: File) {
    const squared = await squareImage(file); const transfer = new DataTransfer(); transfer.items.add(squared); if (fileRef.current) fileRef.current.files = transfer.files;
    setPreview(URL.createObjectURL(squared));
  }
  async function openCamera() {
    setCamera(true);
    try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, aspectRatio: { ideal: 1 } }, audio: false }); streamRef.current = stream; if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); } } catch { stop(); fileRef.current?.click(); }
  }
  async function capture() {
    const video = videoRef.current; if (!video) return; const size = Math.min(video.videoWidth, video.videoHeight); const canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size; canvas.getContext("2d")?.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, size, size);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(), "image/jpeg", .9)); await setFile(new File([blob], "camara.jpg", { type: "image/jpeg" })); stop();
  }

  return <div className="sm:col-span-2"><span className="text-sm font-bold">Fotografía {required ? "" : "(opcional)"}</span><div className="mt-2 flex items-start gap-3 sm:items-center sm:gap-4">{preview ? <img src={preview} alt="Vista previa" className="aspect-square w-24 shrink-0 rounded-2xl object-cover sm:w-36" /> : <div className="grid aspect-square w-24 shrink-0 place-items-center rounded-2xl bg-slate-100 text-3xl text-slate-400 sm:w-36 sm:text-4xl"><BsImage /></div>}<div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2"><button type="button" onClick={openCamera} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-3 text-sm font-bold text-white sm:min-h-12 sm:px-4 sm:text-base"><BsCamera /> Hacer foto</button><button type="button" onClick={() => fileRef.current?.click()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-bold sm:min-h-12 sm:px-4 sm:text-base"><BsImage /> Elegir</button><p className="hidden text-xs text-slate-500 sm:col-span-2 sm:block">La imagen se recorta automáticamente al centro en formato cuadrado.</p></div></div><input ref={fileRef} name="image" type="file" accept="image/*" required={required} className="sr-only" onChange={(event) => event.target.files?.[0] && void setFile(event.target.files[0])} />
    {camera && <div className="fixed inset-0 z-[120] bg-black"><video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full object-cover" /><div className="pointer-events-none absolute inset-0 grid place-items-center p-6"><div className="aspect-square w-full max-w-md rounded-3xl border-4 border-orange-400 shadow-[0_0_0_9999px_rgba(0,0,0,.45)]" /></div><button type="button" onClick={stop} aria-label="Cerrar cámara" className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 grid h-12 w-12 place-items-center rounded-full bg-black/60 text-3xl text-white"><BsX /></button><div className="absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] z-10 flex justify-center"><button type="button" onClick={capture} className="h-20 w-20 rounded-full border-4 border-white bg-white/30 shadow-lg"><span className="sr-only">Hacer fotografía</span></button></div></div>}
  </div>;
}
