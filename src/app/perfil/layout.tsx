import type { ReactNode } from "react";
import { enforceSectionAccess } from "@/lib/sections";

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  await enforceSectionAccess("profile");
  return children;
}
