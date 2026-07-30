"use client";

import Link from "next/link";
import type { CashPlan } from "@/types";
import { fmtDate, fmtMoney } from "@/lib/engine/plan";

export function CashGapHero({ plan }: { plan: CashPlan }) {
  const hasGap = plan.cashGapCad > 0 && plan.gapDate;
  const lastProjectionDate = plan.projection[plan.projection.length - 1]?.date;
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
          <p className="text-sm font-medium text-amber-300">Shortfall</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            You&apos;ll be short{" "}
            <span className="tabular-nums text-amber-200">{fmtMoney(plan.cashGapCad)}</span> on{" "}
            <span className="text-amber-200">{fmtDate(plan.gapDate!)}</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Earn {fmtMoney(plan.cashGapCad)} by {fmtDate(plan.gapDate!)} to cover{" "}
            <span className="font-semibold text-zinc-100">{coverLabel}</span> and keep your
            buffer.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-emerald-300">On track</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50">
            Your budget holds through{" "}
            {lastProjectionDate ? fmtDate(lastProjectionDate) : "the next 7 days"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Your projected balance stays above your buffer target.
          </p>
        </>
      )}

      <div className="mt-5">
        <Link
          href="/plan"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-900/50 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:border-zinc-400"
        >
          View full plan
        </Link>
      </div>
    </section>
  );
}
