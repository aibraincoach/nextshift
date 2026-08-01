"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNav, DemoStrip, TopBar } from "@/components/shared/Nav";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const cover = pathname === "/";

  return (
    <div
      className={`mx-auto flex min-h-full w-full flex-col bg-[var(--color-bg)] ${
        cover ? "max-w-2xl" : "max-w-md"
      }`}
    >
      <TopBar />
      <DemoStrip />
      <main
        className="flex-1"
        style={
          cover
            ? { paddingBottom: "env(safe-area-inset-bottom, 0px)" }
            : { paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }
        }
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
