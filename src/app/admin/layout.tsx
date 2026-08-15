import type { ReactNode } from "react";
import { ValidationShortcut } from "@/features/admin/ValidationShortcut";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="min-w-0 overflow-x-clip pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
      <ValidationShortcut />
    </>
  );
}
