import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Footer } from "@/features/footer/Footer";
import { NavBar } from "@/features/navigation/NavBar";
import { getUsersByIds, type User } from "@/lib/users";
import { getSafeSectionAvailability } from "@/lib/sections";
import { readUserSessionToken, USER_COOKIE_NAME } from "@/lib/user-session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gallardo Camp 2026",
  description: "Web oficial del evento Gallardo Camp 2026.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const enabledSections = await getSafeSectionAvailability();
  let activeUsers: User[] = [];
  let activeUserId: string | null = null;
  try {
    const session = readUserSessionToken(cookieStore.get(USER_COOKIE_NAME)?.value);
    if (session) {
      activeUsers = await getUsersByIds(session.userIds);
      activeUserId = session.activeUserId;
    }
  } catch {
    // Public pages remain available if storage or session configuration fails.
  }

  return (
    <html lang="es">
      <body>
        <NavBar
          activeUsers={activeUsers}
          activeUserId={activeUserId}
          enabledSections={enabledSections}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
