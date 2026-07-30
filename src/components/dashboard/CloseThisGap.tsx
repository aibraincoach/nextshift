"use client";

import Link from "next/link";
import type { CashPlan, Opportunity, Worker, WorkerFinancials } from "@/types";
import { scoreOpportunity } from "@/lib/engine/match";
import {
  fmtDate,
  fmtMoney,
  opportunityDate,
  opportunityImpact,
  type PlanOptions,
} from "@/lib/engine/plan";
import { useDemoState } from "@/lib/storage/demoState";

export function CloseThisGap({
  worker,
  financials,
  demoToday,
  opportunities,
  planOptions,
  plan,
}: {
  worker: Worker;
  financials: WorkerFinancials;
  demoToday: string;
  opportunities: Opportunity[];
  planOptions: PlanOptions;
  plan: CashPlan;
}) {
  const { state } = useDemoState();
  const gapCad = plan.cashGapCad;

  if (gapCad <= 0) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="text-sm text-zinc-400">
          You&apos;re covered. Looking ahead?{" "}
          <Link href="/marketplace" className="font-medium text-emerald-400 hover:text-emerald-300">
            Browse open shifts
          </Link>
        </p>
      </section>
    );
  }

  const ranked = opportunities
    .filter((o) => !state.claimedOpportunityIds.includes(o.id))
    .map((opp) => {
      const impact = opportunityImpact(financials, demoToday, opp, planOptions);
      const score = scoreOpportunity(worker, financials, demoToday, opp, planOptions);
      return { opp, impact, score };
    })
    .filter((r) => r.impact.gapAfterCad < r.impact.gapBeforeCad)
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, 3);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-200">
          {plan.goal
            ? `Close your ${fmtMoney(plan.goal.shortfallCad)} gap by ${fmtDate(plan.goal.byDate)}`
            : "Close this gap"}
        </h2>
        <Link
          href="/marketplace"
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
        >
          See all work
        </Link>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        {plan.goal
          ? "Matched shifts and jobs that move you toward your goal"
          : `Matched shifts and jobs that reduce your ${fmtMoney(gapCad)} shortfall`}
      </p>

      {ranked.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          No open work reduces this gap right now.{" "}
          <Link href="/marketplace" className="text-emerald-400 hover:text-emerald-300">
            Browse marketplace
          </Link>
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-800">
          {ranked.map(({ opp, impact }) => {
            const date = opportunityDate(opp, demoToday);
            const afterLabel = impact.closesGap
              ? "closes it"
              : `→ gap ${fmtMoney(impact.gapAfterCad)}`;
            return (
              <li key={opp.id}>
                <Link
                  href={`/marketplace/${opp.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 hover:bg-zinc-800/40 -mx-1 px-1 rounded-lg"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-100">{opp.role}</div>
                    <div className="truncate text-xs text-zinc-500">
                      {opp.employerName} · {fmtDate(date)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold tabular-nums text-emerald-300">
                      {fmtMoney(impact.netCad)}
                    </div>
                    <div className="text-[11px] text-zinc-500">{afterLabel}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
