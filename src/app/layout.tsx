import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppDataProvider } from "@/lib/data/useAppData";
import { BottomNav, TopBar } from "@/components/shared/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-100">
        <AppDataProvider>
          <TopBar />
          <main className="mx-auto w-full max-w-md px-4 pb-24 pt-4">{children}</main>
          <BottomNav />
        </AppDataProvider>
      </body>
    </html>
  );
}
