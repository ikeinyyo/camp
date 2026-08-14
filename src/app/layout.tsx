import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/features/footer/Footer";
import { NavBar } from "@/features/navigation/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gallardo Camp 2026",
  description: "Web oficial del evento Gallardo Camp 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
