import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { AppDataProvider } from "@/lib/data/useAppData";
import { BottomNav, DemoStrip, TopBar } from "@/components/shared/Nav";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NextShift",
  description:
    "NextShift turns a worker's cash-flow gap into an earnings plan, then matches shifts and jobs that close it.",
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
          <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-[var(--color-bg)]">
            <TopBar />
            <DemoStrip />
            <main
              className="flex-1"
              style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
            >
              {children}
            </main>
            <BottomNav />
          </div>
        </AppDataProvider>
      </body>
    </html>
  );
}
