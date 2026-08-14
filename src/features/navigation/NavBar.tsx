"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigationItems = [{ label: "Agenda", href: "/agenda" }];

export function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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

        <button
          type="button"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((open) => !open)}
          className="ml-auto grid h-11 w-11 place-items-center rounded-xl text-slate-800 transition hover:bg-slate-100 md:hidden"
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
