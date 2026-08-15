"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsGrid, BsQrCodeScan } from "react-icons/bs";
import { GiMeal, GiMicrophone } from "react-icons/gi";

const items = [
  { href: "/admin/validation", label: "Validar", icon: BsQrCodeScan, primary: true },
  { href: "/admin/tapas", label: "Tapas", icon: GiMeal },
  { href: "/admin/talentos", label: "Talentos", icon: GiMicrophone },
  { href: "/admin", label: "Más", icon: BsGrid },
] as const;

export function ValidationShortcut() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <>
      <nav aria-label="Navegación móvil de administración" className="fixed inset-x-0 bottom-0 z-[90] h-[calc(3.75rem+env(safe-area-inset-bottom))] border-t border-slate-200 bg-white shadow-[0_-6px_18px_rgb(15_23_42/0.12)] md:hidden">
        <ul className="flex h-[60px] w-full flex-row items-stretch">
          {items.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href || ["/admin/users", "/admin/sections", "/admin/vouchers", "/admin/activities"].some((path) => pathname.startsWith(path)) : pathname.startsWith(item.href);
            const Icon = item.icon;
            const primary = "primary" in item && item.primary;
            return (
              <li key={item.href} className="h-[60px] min-w-0 flex-1 basis-1/4">
                <Link href={item.href} aria-current={active ? "page" : undefined} className={`flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold leading-none transition ${active ? "text-[var(--accent)]" : "text-slate-500"}`}>
                  <span className={`grid h-7 w-11 place-items-center rounded-lg text-lg ${primary ? "bg-[var(--accent)] text-white shadow-sm" : active ? "bg-[var(--accent-subtle)]" : ""}`}>
                    <Icon aria-hidden="true" />
                  </span>
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
