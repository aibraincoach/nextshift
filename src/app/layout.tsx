import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { AppDataProvider } from "@/lib/data/useAppData";
import { AppChrome } from "@/components/shared/AppChrome";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NextShift — Know what you need. Find what pays.",
  description:
    "Hackathon prototype from Cursor Calgary (July 29, 2026) by RayRayRay Tan and Mandeep Saini. Turns a cash shortfall into matched work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} h-full`}>
      <body
        className="min-h-full"
        style={
          {
            ["--font-heading"]: "var(--font-archivo), system-ui, sans-serif",
            ["--font-body"]: "var(--font-archivo), system-ui, sans-serif",
          } as CSSProperties
        }
      >
        <AppDataProvider>
          <AppChrome>{children}</AppChrome>
        </AppDataProvider>
      </body>
    </html>
  );
}
