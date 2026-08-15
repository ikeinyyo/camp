import type { ReactNode } from "react";
import { enforceSectionAccess } from "@/lib/sections";

export default async function MapLayout({ children }: { children: ReactNode }) {
  await enforceSectionAccess("map");
  return children;
}
