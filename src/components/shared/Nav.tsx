"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  CalendarDays,
  TrendingUp,
  Building2,
  RotateCcw,
} from "lucide-react";
import { useAppData } from "@/lib/data/useAppData";
import { useDemoState } from "@/lib/storage/demoState";

const TABS = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/plan", label: "Plan", icon: TrendingUp },
  { href: "/marketplace", label: "Find work", icon: Search },
  { href: "/my-shifts", label: "My shifts", icon: CalendarDays },
];

const PERSONA_LABELS: Record<string, string> = {
  "W-0014": "Gig delivery",
  "W-0087": "Cleaner",
  "W-0183": "Event staff",
};

function isCover(pathname: string) {
  return pathname === "/";
}

export function TopBar() {
  const pathname = usePathname();
  const employer = pathname.startsWith("/employer");
  const cover = isCover(pathname);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--color-divider)] bg-[var(--color-bg)]">
      <div
        className={`mx-auto flex items-center justify-between px-5 py-3.5 ${
          cover ? "max-w-2xl" : "max-w-md"
        }`}
      >
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="h-3 w-3 bg-[var(--color-accent)]" />
          <span
            className="text-[17px] tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            NextShift
          </span>
        </Link>
        {cover ? (
          <Link
            href="/today"
            className="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-[var(--color-accent-700)] no-underline"
          >
            Enter demo →
          </Link>
        ) : (
          <Link
            href={employer ? "/today" : "/employer"}
            className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs text-[var(--color-neutral-700)] no-underline hover:text-[var(--color-text)]"
          >
            <Building2 size={13} strokeWidth={2} />
            {employer ? "Worker view" : "Employer view"}
          </Link>
        )}
      </div>
    </header>
  );
}

export function DemoStrip() {
  const pathname = usePathname();
  const { data, worker } = useAppData();
  const { update, reset } = useDemoState();
  if (isCover(pathname) || pathname.startsWith("/employer") || !data) return null;

  return (
    <div className="mx-auto flex w-full max-w-md items-center gap-2.5 border-b border-[var(--color-divider)] bg-[var(--color-surface)] px-5 py-2">
      <span
        className="text-[10px] tracking-[0.12em] text-[var(--color-accent-700)]"
        style={{ fontWeight: 800 }}
      >
        DEMO
      </span>
      <span className="seg" style={{ fontSize: 0 }}>
        {data.personaIds.map((id) => {
          const active = worker?.workerId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => update({ selectedWorkerId: id })}
              className="seg-opt"
              style={{
                padding: "5px 10px",
                fontSize: 11,
                minHeight: 44,
                ...(active
                  ? { background: "var(--color-accent)", color: "var(--color-bg)", fontWeight: 600 }
                  : {}),
              }}
            >
              {PERSONA_LABELS[id] ?? id}
            </button>
          );
        })}
      </span>
      <button
        type="button"
        onClick={reset}
        className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2 text-[11px] text-[var(--color-neutral-700)] hover:text-[var(--color-text)]"
      >
        <RotateCcw size={12} strokeWidth={2} />
        Reset
      </button>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  if (isCover(pathname) || pathname.startsWith("/employer")) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t-2 border-[var(--color-divider)] bg-[var(--color-bg)]"
      style={{ paddingBottom: "max(18px, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }, i) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex min-h-[44px] flex-col items-center justify-center gap-1 px-0 py-3 no-underline ${
                i > 0 ? "border-l border-[var(--color-divider)]" : ""
              } ${active ? "text-[var(--color-accent-700)]" : "text-[var(--color-neutral-600)]"}`}
            >
              {active ? (
                <span className="absolute top-0 right-0 left-0 h-[3px] bg-[var(--color-accent)]" />
              ) : null}
              <Icon size={20} strokeWidth={active ? 2.2 : 2} />
              <span
                className="text-[10px] tracking-[0.06em] uppercase"
                style={{ fontWeight: active ? 800 : 600 }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
