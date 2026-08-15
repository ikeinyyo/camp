import type { ReactNode } from "react";
import { enforceSectionAccess } from "@/lib/sections";

export default async function TalentsLayout({ children }: { children: ReactNode }) {
  await enforceSectionAccess("talents");
  return children;
}
