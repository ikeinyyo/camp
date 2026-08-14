"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsCalendarEvent, BsGear, BsPeople, BsQrCodeScan, BsTicketPerforated } from "react-icons/bs";

const items = [
  { href: "/admin", label: "Usuarios", icon: BsPeople },
  { href: "/admin/activities", label: "Agenda", icon: BsCalendarEvent },
  { href: "/admin/validation", label: "Validar", icon: BsQrCodeScan, primary: true },
  { href: "/admin/vouchers", label: "Vales", icon: BsTicketPerforated },
  { href: "/admin/sections", label: "Secciones", icon: BsGear },
] as const;

export function ValidationShortcut() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <>
      <nav aria-label="Navegación móvil de administración" className="fixed inset-x-0 bottom-0 z-[90] border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(15_23_42/0.12)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {items.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            const primary = "primary" in item && item.primary;
            return (
              <li key={item.href} className="min-w-0">
                <Link href={item.href} aria-current={active ? "page" : undefined} className={`relative flex min-h-[4.25rem] flex-col items-center justify-end gap-1 px-1 pb-2 text-[10px] font-bold transition ${active ? "text-[var(--accent)]" : "text-slate-500"}`}>
                  <span className={primary ? "absolute -top-5 grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)] text-2xl text-white shadow-lg ring-4 ring-white" : "text-xl"}>
                    <Icon aria-hidden="true" />
                  </span>
                  {primary && <span className="h-6" />}
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {!pathname.startsWith("/admin/validation") && (
        <Link href="/admin/validation" className="fixed bottom-6 right-6 z-50 hidden min-h-14 items-center gap-3 rounded-2xl bg-[var(--accent)] px-5 py-3 font-black text-white shadow-xl hover:bg-[var(--accent-hover)] md:inline-flex">
          <BsQrCodeScan aria-hidden="true" className="text-xl" /> Validar QR
        </Link>
      )}
    </>
  );
}
