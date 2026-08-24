"use client";

export function ResetDominoButton() {
  return <form action="/admin/domino/reset" method="post" onSubmit={(event) => {
    if (!window.confirm("¿Reiniciar el campeonato? Se eliminarán las parejas, rondas y resultados. Las inscripciones se conservarán.")) event.preventDefault();
  }}>
    <button className="w-full rounded-xl border border-red-300 bg-white px-5 py-3 font-black text-red-700 transition hover:bg-red-50">Reiniciar campeonato</button>
  </form>;
}
