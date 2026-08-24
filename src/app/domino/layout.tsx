import type { ReactNode } from "react";
import { enforceSectionAccess } from "@/lib/sections";

export default async function DominoLayout({ children }: { children: ReactNode }) {
  await enforceSectionAccess("domino");
  return children;
}
