"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, TrendingUp, Building2 } from "lucide-react";

const TABS = [
  { href: "/", label: "Today", icon: Home },
  { href: "/plan", label: "Plan", icon: TrendingUp },
  { href: "/marketplace", label: "Find Work", icon: Search },
  { href: "/my-shifts", label: "My Shifts", icon: CalendarDays },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/employer")) return null;
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const employer = pathname.startsWith("/employer");
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-50">
          Next<span className="text-emerald-400">Shift</span>
        </Link>
        <Link
          href={employer ? "/" : "/employer"}
          className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
        >
          <Building2 size={13} />
          {employer ? "Worker view" : "Employer view"}
        </Link>
      </div>
    </header>
  );
}
