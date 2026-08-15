import type { ReactNode } from "react";
import { enforceSectionAccess } from "@/lib/sections";

export default async function InformationLayout({ children }: { children: ReactNode }) {
  await enforceSectionAccess("information");
  return children;
}
