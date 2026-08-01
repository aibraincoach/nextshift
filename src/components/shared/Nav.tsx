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
  { href: "/", label: "Today", icon: Home },
  { href: "/plan", label: "Plan", icon: TrendingUp },
  { href: "/marketplace", label: "Find work", icon: Search },
  { href: "/my-shifts", label: "My shifts", icon: CalendarDays },
];

const PERSONA_LABELS: Record<string, string> = {
  "W-0014": "Gig delivery",
  "W-0087": "Cleaner",
  "W-0183": "Event staff",
};

export function TopBar() {
  const pathname = usePathname();
  const employer = pathname.startsWith("/employer");
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--color-divider)] bg-[var(--color-bg)]">
      <div className="flex items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="h-3 w-3 bg-[var(--color-accent)]" />
          <span
            className="text-[17px] tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            NextShift
          </span>
        </Link>
        <Link
          href={employer ? "/" : "/employer"}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-neutral-700)] no-underline hover:text-[var(--color-text)]"
        >
          <Building2 size={13} strokeWidth={2} />
          {employer ? "Worker view" : "Employer view"}
        </Link>
      </div>
    </header>
  );
}

export function DemoStrip() {
  const pathname = usePathname();
  const { data, worker } = useAppData();
  const { update, reset } = useDemoState();
  if (pathname.startsWith("/employer") || !data) return null;

  return (
    <div className="flex items-center gap-2.5 border-b border-[var(--color-divider)] bg-[var(--color-surface)] px-5 py-2">
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
        className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-[var(--color-neutral-700)] hover:text-[var(--color-text)]"
      >
        <RotateCcw size={12} strokeWidth={2} />
        Reset
      </button>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/employer")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t-2 border-[var(--color-divider)] bg-[var(--color-bg)] pb-[18px]">
      <div className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }, i) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-1 px-0 py-3 no-underline ${
                i > 0 ? "border-l border-[var(--color-divider)]" : ""
              } ${active ? "text-[var(--color-accent)]" : "text-[var(--color-neutral-600)]"}`}
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
