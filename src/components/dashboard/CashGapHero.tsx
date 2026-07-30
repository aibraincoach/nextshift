"use client";

import Link from "next/link";
import type { CashPlan } from "@/types";
import { fmtDate, fmtMoney } from "@/lib/engine/plan";

export function CashGapHero({ plan }: { plan: CashPlan }) {
  const hasGap = plan.cashGapCad > 0 && plan.gapDate;
  const nextObl = plan.upcomingObligations[0];
  const coverLabel = nextObl?.name ?? "your next bill";

  return (
    <section
      className={`rounded-2xl border p-5 ${
        hasGap
          ? "border-amber-500/40 bg-amber-500/10"
          : "border-emerald-500/40 bg-emerald-500/10"
      }`}
    >
      {hasGap ? (
        <>
          <p className="text-sm font-medium text-amber-300">Cash gap</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 tabular-nums">
            Earn {fmtMoney(plan.cashGapCad)}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            by <span className="font-semibold text-amber-200">{fmtDate(plan.gapDate!)}</span> to
            cover <span className="font-semibold text-zinc-100">{coverLabel}</span> and keep your
            buffer
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-emerald-300">On track</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50">
            You&apos;re covered for the next 7 days
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Your projected balance stays above your buffer target.
          </p>
        </>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/marketplace"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
        >
          Find a shift
        </Link>
        <Link
          href="/plan"
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-600 bg-zinc-900/50 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:border-zinc-400"
        >
          View my plan
        </Link>
      </div>
    </section>
  );
}
