"use client";

import Link from "next/link";
import type { Opportunity, Worker, WorkerFinancials } from "@/types";
import { compareAdvanceVsShift } from "@/lib/engine/ewa";
import { scoreOpportunity } from "@/lib/engine/match";
import { fmtDate, fmtMoney, type PlanOptions } from "@/lib/engine/plan";
import { useDemoState } from "@/lib/storage/demoState";

export function AdvanceVsShift({
  worker,
  financials,
  demoToday,
  opportunities,
  planOptions,
}: {
  worker: Worker;
  financials: WorkerFinancials;
  demoToday: string;
  opportunities: Opportunity[];
  planOptions: PlanOptions;
}) {
  const { state } = useDemoState();

  const candidates = opportunities.filter(
    (o) =>
      (o.type === "shift" || o.type === "released-shift") &&
      !state.claimedOpportunityIds.includes(o.id)
  );

  let bestShift: Opportunity | null = null;
  let bestScore = -1;
  for (const opp of candidates) {
    const score = scoreOpportunity(worker, financials, demoToday, opp, planOptions);
    if (score.total > bestScore) {
      bestScore = score.total;
      bestShift = opp;
    }
  }

  const comparison = compareAdvanceVsShift(financials, demoToday, bestShift, planOptions);
  if (!comparison) return null;

  const { advance, shift } = comparison;

  return (
    <section className="px-5 py-5 pb-8">
      <h2
        className="text-base text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
      >
        Advance vs. a shift
      </h2>
      <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
        Closing a {fmtMoney(comparison.gapCad)} gap — fees vs. earnings
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-[var(--color-divider)] bg-[var(--color-surface)] p-3">
          <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-neutral-500)]">
            Advance
          </div>
          <div
            className="mt-1 text-lg tabular-nums text-[var(--color-text)]"
            style={{ fontWeight: 800 }}
          >
            {fmtMoney(advance.amountCad)}
          </div>
          <div className="mt-2 space-y-1 text-xs text-[var(--color-neutral-700)]">
            <div>
              Fee{" "}
              <span className="tabular-nums text-[var(--color-accent-700)]">
                {fmtMoney(advance.feeCad)}
              </span>{" "}
              ({advance.feeRatePct}%)
            </div>
            <div>
              Repayment hits{" "}
              <span className="text-[var(--color-text)]">{fmtDate(advance.repaymentDate)}</span>
            </div>
            <div>
              {advance.historyCount} advances taken before,{" "}
              <span className="tabular-nums">{fmtMoney(advance.historyFeesCad)}</span> in fees
            </div>
          </div>
        </div>

        <div className="border border-[var(--color-divider)] bg-[var(--color-surface)] p-3">
          <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-neutral-500)]">
            Work a shift
          </div>
          {shift && bestShift ? (
            <>
              <div
                className="mt-1 text-lg tabular-nums text-[var(--color-text)]"
                style={{ fontWeight: 800 }}
              >
                {fmtMoney(shift.netCad)}
              </div>
              <div className="mt-2 space-y-1 text-xs text-[var(--color-neutral-700)]">
                <div>
                  Fees <span className="tabular-nums">{fmtMoney(0)}</span>
                </div>
                <div>+{shift.bufferDaysGained} buffer days</div>
                <div>
                  Pays <span className="text-[var(--color-text)]">{fmtDate(shift.payoutDate)}</span>
                </div>
                <Link
                  href={`/marketplace/${bestShift.id}`}
                  className="mt-2 inline-block no-underline text-[var(--color-accent-700)] hover:text-[var(--color-accent)]"
                  style={{ fontWeight: 600 }}
                >
                  View shift →
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-2 text-xs text-[var(--color-neutral-600)]">No open shifts to compare.</p>
          )}
        </div>
      </div>
    </section>
  );
}
