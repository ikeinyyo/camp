"use client";

import { useState } from "react";
import { BsCheck2, BsShare } from "react-icons/bs";

export function ShareProfileButton({ username, displayName }: { username: string; displayName: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(`/perfil/${encodeURIComponent(username)}`, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: `${displayName} | Gallardo Camp 2026`, text: `Mira el perfil de ${displayName} en Gallardo Camp`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setCopied(false);
    }
  }

  return <button type="button" onClick={() => void share()} aria-label={copied ? "Enlace copiado" : "Compartir perfil"} title={copied ? "Enlace copiado" : "Compartir perfil"} className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-white/10 text-xl text-white shadow-lg backdrop-blur transition hover:bg-white/20">{copied ? <BsCheck2 aria-hidden="true" /> : <BsShare aria-hidden="true" />}</button>;
}
