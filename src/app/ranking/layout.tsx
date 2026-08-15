import type { ReactNode } from "react";
import { enforceSectionAccess } from "@/lib/sections";

export default async function RankingLayout({ children }: { children: ReactNode }) {
  await enforceSectionAccess("ranking");
  return children;
}
