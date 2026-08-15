import type { ReactNode } from "react";
import { enforceSectionAccess } from "@/lib/sections";

export default async function TapasLayout({ children }: { children: ReactNode }) {
  await enforceSectionAccess("tapas");
  return children;
}
