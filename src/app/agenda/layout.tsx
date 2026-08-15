import type { ReactNode } from "react";
import { enforceSectionAccess } from "@/lib/sections";

export default async function AgendaLayout({ children }: { children: ReactNode }) {
  await enforceSectionAccess("agenda");
  return children;
}
