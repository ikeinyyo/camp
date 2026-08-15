import type { ReactNode } from "react";
import { enforceSectionAccess } from "@/lib/sections";

export default async function VouchersLayout({ children }: { children: ReactNode }) {
  await enforceSectionAccess("vouchers");
  return children;
}
