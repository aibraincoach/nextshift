"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function EmployerHeader() {
  const pathname = usePathname();
  return (
    <header className="mb-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
          <Building2 className="h-5 w-5 text-zinc-300" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Chinook Warehousing</h1>
          <p className="text-xs text-zinc-500">Employer account · EMP-901</p>
        </div>
      </div>
      <nav className="mt-4 flex gap-2 text-sm">
        <Link
          href="/employer"
          className={`rounded-md px-3 py-1.5 ${
            pathname === "/employer"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/employer/post"
          className={`rounded-md px-3 py-1.5 ${
            pathname === "/employer/post"
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Post shift or job
        </Link>
      </nav>
    </header>
  );
}
