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
    <section className="px-5 py-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Your budget
        </h2>
        <Link
          href="/needs"
          className="text-xs no-underline text-[var(--color-accent-700)] hover:text-[var(--color-accent)]"
          style={{ fontWeight: 600 }}
        >
          Edit needs →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-neutral-500)]">
            Buffer
          </div>
          <div
            className="mt-1 text-base tabular-nums text-[var(--color-text)]"
            style={{ fontWeight: 800 }}
          >
            {fmtMoney(plan.bufferTargetCad)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-neutral-500)]">
            Daily spend
          </div>
          <div
            className="mt-1 text-base tabular-nums text-[var(--color-text)]"
            style={{ fontWeight: 800 }}
          >
            {fmtMoney(dailySpendCad)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-neutral-500)]">
            Next bill
          </div>
          <div
            className="mt-1 text-base tabular-nums text-[var(--color-text)]"
            style={{ fontWeight: 800 }}
          >
            {nextObl ? fmtMoney(nextObl.amountCad) : "—"}
          </div>
          {nextObl ? (
            <div className="mt-0.5 truncate text-[11px] text-[var(--color-neutral-600)]">
              {nextObl.name} · {fmtDate(nextObl.date)}
            </div>
          ) : (
            <div className="mt-0.5 text-[11px] text-[var(--color-neutral-500)]">None soon</div>
          )}
        </div>
      </div>
    </section>
  );
}
