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
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="text-sm font-semibold text-zinc-200">Advance vs. a shift</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Closing a {fmtMoney(comparison.gapCad)} gap — fees vs. earnings
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Advance
          </div>
          <div className="mt-1 text-lg font-bold tabular-nums text-zinc-100">
            {fmtMoney(advance.amountCad)}
          </div>
          <div className="mt-2 space-y-1 text-xs text-zinc-400">
            <div>
              Fee{" "}
              <span className="tabular-nums text-amber-300">{fmtMoney(advance.feeCad)}</span> (
              {advance.feeRatePct}%)
            </div>
            <div>
              Repayment hits{" "}
              <span className="text-zinc-200">{fmtDate(advance.repaymentDate)}</span>
            </div>
            <div>
              {advance.historyCount} advances taken before,{" "}
              <span className="tabular-nums">{fmtMoney(advance.historyFeesCad)}</span> in fees
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-emerald-400/80">
            Work a shift
          </div>
          {shift && bestShift ? (
            <>
              <div className="mt-1 text-lg font-bold tabular-nums text-emerald-300">
                {fmtMoney(shift.netCad)}
              </div>
              <div className="mt-2 space-y-1 text-xs text-zinc-400">
                <div>
                  Fees <span className="tabular-nums text-emerald-300">{fmtMoney(0)}</span>
                </div>
                <div>
                  +{shift.bufferDaysGained} buffer days
                </div>
                <div>
                  Pays{" "}
                  <span className="text-zinc-200">{fmtDate(shift.payoutDate)}</span>
                </div>
                <Link
                  href={`/marketplace/${bestShift.id}`}
                  className="mt-2 inline-block font-medium text-emerald-400 hover:text-emerald-300"
                >
                  View shift →
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">No open shifts to compare.</p>
          )}
        </div>
      </div>
    </section>
  );
}
