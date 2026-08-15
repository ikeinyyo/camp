"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BsChevronDown, BsPersonCircle, BsX } from "react-icons/bs";
import type { SectionAvailability } from "@/config/sections";
import type { User } from "@/lib/users";
import { UserAvatar } from "@/features/users/UserAvatar";

export function NavBar({
  activeUsers,
  activeUserId,
  enabledSections,
}: {
  activeUsers: User[];
  activeUserId: string | null;
  enabledSections: SectionAvailability;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const accessMenuRef = useRef<HTMLDetailsElement>(null);
  const activeUser =
    activeUsers.find((user) => user.id === activeUserId) ?? activeUsers[0];
  const navigationItems = [
    ...(enabledSections.agenda ? [{ label: "Agenda", href: "/agenda" }] : []),
    ...(enabledSections.map ? [{ label: "Mapa", href: "/mapa" }] : []),
    ...(enabledSections.information ? [{ label: "Información", href: "/informacion" }] : []),
    ...(activeUser && enabledSections.profile
      ? [{ label: "Perfil", href: "/perfil" }]
      : []),
    ...(activeUser && enabledSections.vouchers
      ? [{ label: "Vales", href: "/vales" }]
      : []),
    ...(enabledSections.tapas
      ? [{ label: "Tapas", href: "/tapas" }]
      : []),
    ...(enabledSections.talents
      ? [{ label: "Talentos", href: "/talentos" }]
      : []),
    ...(enabledSections.ranking
      ? [{ label: "Ranking", href: "/ranking" }]
      : []),
  ];

  useEffect(() => {
    function closeWhenClickingOutside(event: PointerEvent) {
      if (!accessMenuRef.current?.contains(event.target as Node)) {
        accessMenuRef.current?.removeAttribute("open");
      }
    }

    document.addEventListener("pointerdown", closeWhenClickingOutside);
    return () => document.removeEventListener("pointerdown", closeWhenClickingOutside);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex min-h-16 max-w-6xl items-center px-4 sm:px-6"
      >
        <div className="flex items-center gap-6">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            aria-current={pathname === "/" ? "page" : undefined}
            className="text-lg font-extrabold tracking-tight text-[var(--primary-dark)]"
          >
            Gallardo Camp
          </Link>

          <ul className="hidden items-center gap-2 md:flex">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] aria-[current=page]:bg-[var(--accent-soft)] aria-[current=page]:text-[var(--accent-hover)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {enabledSections.access && <details
            ref={accessMenuRef}
            className="group relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                event.currentTarget.removeAttribute("open");
              }
            }}
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-[var(--primary-dark)] transition hover:bg-[var(--primary-subtle)] sm:px-3 [&::-webkit-details-marker]:hidden">
              <BsPersonCircle aria-hidden="true" className="text-xl text-[var(--accent)]" />
              <span className="hidden sm:inline">Acceso</span>
              <BsChevronDown aria-hidden="true" className="text-xs transition group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {activeUser && (
                <>
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Usuarios activos
                  </p>
                </div>
                <div className="p-2">
                  {activeUsers.map((user) => (
                    <div key={user.id} className={`flex items-center rounded-xl ${user.id === activeUser.id ? "bg-[var(--accent-subtle)]" : ""}`}>
                      <form action="/session/active" method="post" className="min-w-0 flex-1">
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--primary-subtle)]">
                          <span className="mr-1 shrink-0"><UserAvatar user={user} className="h-9 w-9" textClassName="text-sm" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{user.displayName}</span>
                            <span className="block truncate text-xs text-slate-500">@{user.username}</span>
                          </span>
                          <span className="ml-2 whitespace-nowrap text-sm font-bold text-[var(--accent)]">{user.points} pts</span>
                        </button>
                      </form>
                      <form action="/session/remove" method="post" className="pr-1">
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" aria-label={`Cerrar sesión de ${user.displayName}`} title={`Cerrar sesión de ${user.displayName}`} className="grid h-9 w-9 place-items-center rounded-lg text-xl text-slate-500 transition hover:bg-red-50 hover:text-red-700">
                          <BsX aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
                </>
              )}
              <div className="grid gap-1 border-t border-slate-100 p-2">
                <Link href="/login" className="rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-[var(--primary-subtle)]">Iniciar sesión</Link>
                <Link href="/registro" className="rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-[var(--primary-subtle)]">Crear usuario</Link>
              </div>
            </div>
          </details>}

          <button
          type="button"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((open) => !open)}
          className="grid h-11 w-11 place-items-center rounded-xl text-slate-800 transition hover:bg-slate-100 md:hidden"
        >
          <span aria-hidden="true" className="relative block h-5 w-6">
            <span
              className={`absolute left-0 top-0 h-0.5 w-6 bg-current transition ${isOpen ? "translate-y-[9px] rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 top-[9px] h-0.5 w-6 bg-current transition ${isOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`absolute left-0 top-[18px] h-0.5 w-6 bg-current transition ${isOpen ? "-translate-y-[9px] -rotate-45" : ""}`}
            />
          </span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        className={`border-t border-slate-200 px-4 md:hidden ${isOpen ? "block" : "hidden"}`}
      >
        <ul className="mx-auto max-w-6xl py-3">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className="block rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] aria-[current=page]:bg-[var(--accent-soft)] aria-[current=page]:text-[var(--accent-hover)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
