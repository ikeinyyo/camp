import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BsBagCheckFill,
  BsGiftFill,
  BsMegaphoneFill,
  BsMusicNoteBeamed,
  BsPersonCircle,
  BsQrCode,
  BsStars,
  BsTicketPerforatedFill,
  BsWallet2,
} from "react-icons/bs";
import { isSectionEnabled } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Información | Gallardo Camp 2026",
  description: "Todo lo que necesitas preparar y saber antes de la Gallardo Camp 2026.",
};

const preparations = [
  {
    icon: BsPersonCircle,
    title: "Prepara tu perfil",
    text: "Cuando el acceso esté disponible, crea tu usuario, sube una foto y añade tu grito de guerra desde la página de perfil.",
    action: { href: "/perfil", label: "Ir a mi perfil", external: false },
  },
  {
    icon: BsGiftFill,
    title: "Cinco regalos por familia",
    text: "Preparad cinco regalos para el bingo. Deben ser cosas con valor que merezcan una nueva vida en otra casa. Traedlos envueltos para mantener la sorpresa.",
    action: undefined,
  },
  {
    icon: BsMusicNoteBeamed,
    title: "La banda sonora",
    text: "Únete como colaborador a la lista de Spotify y añade las canciones que no pueden faltar en la Gallardo Camp 2026.",
    action: {
      href: "https://open.spotify.com/playlist/3xNAhgxAouRQXpIcZC4kXs?si=5b776632974e47f4&pt=e8514830e8d3963a20b7631115b4875e",
      label: "Abrir playlist de Spotify",
      external: true,
    },
  },
  {
    icon: BsMegaphoneFill,
    title: "Tu actuación",
    text: "Prepara una actuación para el concurso de talentos. Puede ser individual o en grupo: música, humor, baile, trucos o cualquier habilidad con la que sorprender a la familia.",
    action: undefined,
  },
  {
    icon: BsBagCheckFill,
    title: "Tu tapa",
    text: "Idea tu propuesta para el concurso de tapas y compra los ingredientes que necesites. El sábado también habrá tiempo para hacer compras en La Romana.",
    action: undefined,
  },
] as const;

export default async function InformationPage() {
  if (!(await isSectionEnabled("information"))) redirect("/");

  return <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
    <div className="mx-auto max-w-5xl">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-black uppercase tracking-[.25em] text-[var(--accent)]">Gallardo Camp 2026</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Todo listo para el campamento</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">Qué tienes que preparar, cómo funcionará la aplicación y algún pequeño detalle para que el fin de semana salga redondo.</p>
      </header>

      <section className="mt-12">
        <div className="mb-6"><p className="text-sm font-black uppercase tracking-[.2em] text-[var(--primary)]">Antes de venir</p><h2 className="mt-2 text-3xl font-black">¿Qué necesitas preparar?</h2><p className="mt-2 text-slate-600">Un poco de preparación ahora nos dejará más tiempo para disfrutar allí.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          {preparations.map(({ icon: Icon, title, text, action }, index) => <article key={title} className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${index === preparations.length - 1 ? "md:col-span-2" : ""}`}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--primary-subtle)] text-xl text-[var(--primary)]"><Icon /></span>
            <h3 className="mt-4 text-xl font-black">{title}</h3>
            <p className="mt-2 leading-7 text-slate-600">{text}</p>
            {action && (action.external
              ? <a href={action.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)]">{action.label}</a>
              : <Link href={action.href} className="mt-5 inline-flex rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--primary-dark)]">{action.label}</Link>)}
          </article>)}
        </div>
      </section>

      <section className="mt-14 overflow-hidden rounded-3xl bg-[var(--primary-dark)] text-white shadow-xl">
        <div className="p-6 sm:p-9"><p className="text-sm font-black uppercase tracking-[.2em] text-orange-400">Durante el evento</p><h2 className="mt-2 text-3xl font-black">La app será nuestro centro de operaciones</h2><p className="mt-3 max-w-3xl leading-7 text-emerald-50/80">Aquí estarán la agenda, el mapa, los concursos, los puntos y las tareas. Es importante tenerla a mano para saber qué toca y no dejar ningún punto por el camino.</p></div>
        <div className="grid gap-px bg-white/10 sm:grid-cols-3">
          <div className="bg-emerald-950 p-6"><BsPersonCircle className="text-2xl text-orange-400"/><h3 className="mt-4 font-black">Varios usuarios, un móvil</h3><p className="mt-2 text-sm leading-6 text-emerald-50/75">Puedes mantener varios participantes activos en el mismo dispositivo. Así niños y mayores sin teléfono también podrán usar la aplicación.</p></div>
          <div className="bg-emerald-950 p-6"><BsQrCode className="text-2xl text-orange-400"/><h3 className="mt-4 font-black">Participación mediante QR</h3><p className="mt-2 text-sm leading-6 text-emerald-50/75">Las actividades con puntos generarán un QR. El organizador lo escaneará para validar la participación y añadir los puntos al perfil correcto.</p></div>
          <div className="bg-emerald-950 p-6"><BsTicketPerforatedFill className="text-2xl text-orange-400"/><h3 className="mt-4 font-black">Vales por echar una mano</h3><p className="mt-2 text-sm leading-6 text-emerald-50/75">Si quieres encargarte de una tarea, avisa antes al organizador. Cuando la termines, validará el vale y recibirás sus puntos. La iniciativa suma; desaparecer con la escoba, no tanto.</p></div>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-6 sm:flex sm:items-center sm:gap-6 sm:p-8">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-2xl text-white"><BsWallet2 /></span>
        <div className="mt-4 sm:mt-0"><p className="text-sm font-black uppercase tracking-[.18em] text-[var(--accent)]">Patrocinio de altísimo nivel</p><h2 className="mt-1 text-2xl font-black">El tiempo es oro. Y los premios tampoco son gratis.</h2><p className="mt-2 leading-7 text-slate-700">Organizar la Gallardo Camp requiere tiempo, logística y una pequeña inversión destinada principalmente a los premios y a otros materiales necesarios para el evento. Se aceptan Bizum de <strong>5 € a Sergio Gallardo</strong>. No garantizan puntos extra, decisiones favorables del jurado ni inmunidad en el bingo… pero mantienen contento al comité organizador.</p></div>
      </section>

      <div className="mt-8 flex items-center justify-center gap-2 text-center text-sm font-bold text-[var(--primary)]"><BsStars /> Ven preparado para participar, ayudar y pasarlo muy bien.</div>
    </div>
  </main>;
}
