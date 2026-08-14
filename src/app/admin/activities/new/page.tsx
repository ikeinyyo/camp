import Link from "next/link";
import { ActivityForm } from "@/features/admin/ActivityForm";
export default function NewActivityPage() { return <main className="min-h-screen px-4 py-10"><section className="mx-auto max-w-3xl"><Link href="/admin/activities" className="text-sm font-bold text-[var(--primary)]">← Volver</Link><h1 className="my-6 text-3xl font-black">Crear actividad</h1><ActivityForm action="/admin/activities/create" /></section></main>; }
