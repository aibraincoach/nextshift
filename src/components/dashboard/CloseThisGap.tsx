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
      <section className="px-5 py-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Close this gap
        </h2>
        <p className="mt-2 text-sm text-[var(--color-neutral-700)]">
          You&apos;re covered. Looking ahead?{" "}
          <Link
            href="/marketplace"
            className="no-underline text-[var(--color-accent-700)] hover:text-[var(--color-accent)]"
            style={{ fontWeight: 600 }}
          >
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

  const title = plan.goal
    ? `Close your ${fmtMoney(plan.goal.shortfallCad)} gap by ${fmtDate(plan.goal.byDate)}`
    : "Close this gap";

  return (
    <section className="px-5 py-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          {title}
        </h2>
        <Link
          href="/marketplace"
          className="shrink-0 text-xs no-underline text-[var(--color-accent-700)] hover:text-[var(--color-accent)]"
          style={{ fontWeight: 600 }}
        >
          See all work →
        </Link>
      </div>

      {ranked.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-neutral-600)]">
          No open work reduces this gap right now.{" "}
          <Link
            href="/marketplace"
            className="no-underline text-[var(--color-accent-700)] hover:text-[var(--color-accent)]"
          >
            Browse marketplace
          </Link>
        </p>
      ) : (
        <ul className="mt-4 border-t-2 border-[var(--color-divider)]">
          {ranked.map(({ opp, impact }) => {
            const date = opportunityDate(opp, demoToday);
            return (
              <li key={opp.id} className="border-t border-[var(--color-divider)] first:border-t-0">
                <Link
                  href={`/marketplace/${opp.id}`}
                  className="flex items-center justify-between gap-3 py-3 no-underline text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm" style={{ fontWeight: 600 }}>
                      {opp.role}
                    </div>
                    <div className="truncate text-xs text-[var(--color-neutral-600)]">
                      {opp.employerName} · {fmtDate(date)}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="text-sm tabular-nums" style={{ fontWeight: 800 }}>
                      {fmtMoney(impact.netCad)}
                    </div>
                    {impact.closesGap ? (
                      <span className="tag tag-outline">Closes it</span>
                    ) : (
                      <span className="text-[11px] tabular-nums text-[var(--color-neutral-600)]">
                        gap → {fmtMoney(impact.gapAfterCad)}
                      </span>
                    )}
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
