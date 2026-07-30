"use client";

import Link from "next/link";
import type { CashPlan } from "@/types";
import { fmtDate, fmtMoney } from "@/lib/engine/plan";

export function BudgetSummary({
  plan,
  dailySpendCad,
}: {
  plan: CashPlan;
  dailySpendCad: number;
}) {
  const nextObl = plan.upcomingObligations[0];

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-200">Your budget</h2>
        <Link
          href="/needs"
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
        >
          Edit needs
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">Buffer</div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-100">
            {fmtMoney(plan.bufferTargetCad)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">Daily spend</div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-100">
            {fmtMoney(dailySpendCad)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">Next bill</div>
          <div className="mt-0.5 text-sm font-semibold tabular-nums text-zinc-100">
            {nextObl ? fmtMoney(nextObl.amountCad) : "—"}
          </div>
          <div className="text-[11px] text-zinc-500 truncate">
            {nextObl ? `${nextObl.name} · ${fmtDate(nextObl.date)}` : "None soon"}
          </div>
        </div>
      </div>
    </section>
  );
}
