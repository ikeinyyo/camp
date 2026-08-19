import type { ReactNode } from "react";
import { enforceSectionAccess } from "@/lib/sections";

export default async function GamesLayout({ children }: { children: ReactNode }) {
  await enforceSectionAccess("games");
  return children;
}
