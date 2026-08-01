"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function EmployerHeader() {
  const pathname = usePathname();
  return (
    <header className="mb-5 px-5 pt-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center border-2 border-[var(--color-divider)] bg-[var(--color-surface)]">
          <Building2 className="h-5 w-5 text-[var(--color-text)]" />
        </div>
        <div>
          <h1
            className="text-[20px] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            Chinook Warehousing
          </h1>
          <p className="text-xs text-muted">Employer account · EMP-901</p>
        </div>
      </div>
      <nav className="mt-4 flex gap-2 text-sm">
        <Link
          href="/employer"
          className={`btn ${pathname === "/employer" ? "btn-primary" : "btn-secondary"}`}
        >
          Dashboard
        </Link>
        <Link
          href="/employer/post"
          className={`btn ${pathname === "/employer/post" ? "btn-primary" : "btn-secondary"}`}
        >
          Post shift or job
        </Link>
      </nav>
    </header>
  );
}
