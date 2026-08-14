import Link from "next/link";

export function AdminNavigation({ active }: { active: "users" | "sections" | "vouchers" | "activities" | "validation" }) {
  const items = [
    { id: "users", label: "Usuarios", href: "/admin" },
    { id: "sections", label: "Secciones", href: "/admin/sections" },
    { id: "vouchers", label: "Vales", href: "/admin/vouchers" },
    { id: "activities", label: "Actividades", href: "/admin/activities" },
    { id: "validation", label: "Validación", href: "/admin/validation" },
  ] as const;

  return (
    <nav aria-label="Administración" className="mt-6 hidden gap-1 overflow-x-auto border-b border-slate-200 md:flex">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-current={active === item.id ? "page" : undefined}
          className="-mb-px shrink-0 border-b-2 border-transparent px-4 py-3 text-sm font-bold text-slate-600 transition hover:text-[var(--primary)] aria-[current=page]:border-[var(--accent)] aria-[current=page]:text-[var(--primary-dark)]"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
