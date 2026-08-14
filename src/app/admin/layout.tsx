import type { ReactNode } from "react";
import { ValidationShortcut } from "@/features/admin/ValidationShortcut";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="min-w-0 overflow-x-clip pb-24 md:pb-0">{children}</div>
      <ValidationShortcut />
    </>
  );
}
