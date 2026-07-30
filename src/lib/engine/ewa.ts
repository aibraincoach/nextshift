import type { Opportunity, WorkerFinancials } from "@/types";
import { addDays, buildCashPlan, opportunityPayoutDate, type PlanOptions } from "./plan";

export interface EwaComparison {
  gapCad: number;
  advance: {
    amountCad: number;
    feeCad: number;
    feeRatePct: number;
    repaymentDate: string;
    /** gap on the week after repayment hits */
    residualGapCad: number;
    historyCount: number;
    historyFeesCad: number;
  };
  shift: {
    netCad: number;
    feeCad: 0;
    payoutDate: string;
    bufferDaysGained: number;
    residualGapCad: number;
  } | null;
}

/**
 * Compares taking an earned-wage advance against working a recommended shift.
 * Advance fee rate comes from the worker's real advance history; repayment is
 * modelled as a debit one week out, which is where advances usually bite.
 */
export function compareAdvanceVsShift(
  fin: WorkerFinancials,
  demoToday: string,
  bestShift: Opportunity | null,
  baseOpts: PlanOptions = {}
): EwaComparison | null {
  const base = buildCashPlan(fin, demoToday, baseOpts);
  if (base.cashGapCad <= 0) return null;

  const gap = base.cashGapCad;
  const feeRate = fin.advances.avgFeeRate || 0.03;
  const fee = Math.round(gap * feeRate * 100) / 100;
  const repaymentDate = addDays(demoToday, 7);

  // Advance covers today's gap but repayment (amount + fee) lands next week.
  const withAdvance = buildCashPlan(fin, demoToday, {
    ...baseOpts,
    horizonDays: 14,
    extraIncome: [
      ...(baseOpts.extraIncome ?? []),
      { date: demoToday, netCad: gap },
      { date: repaymentDate, netCad: -(gap + fee) },
    ],
  });

  let shift: EwaComparison["shift"] = null;
  if (bestShift) {
    const payoutDate = opportunityPayoutDate(bestShift, demoToday);
    const withShift = buildCashPlan(fin, demoToday, {
      ...baseOpts,
      horizonDays: 14,
      extraIncome: [...(baseOpts.extraIncome ?? []), { date: payoutDate, netCad: bestShift.estimatedNetCad }],
    });
    shift = {
      netCad: bestShift.estimatedNetCad,
      feeCad: 0,
      payoutDate,
      bufferDaysGained:
        Math.round((bestShift.estimatedNetCad / Math.max(5, fin.avgDailyEssentialSpendCad)) * 10) / 10,
      residualGapCad: withShift.cashGapCad,
    };
  }

  return {
    gapCad: gap,
    advance: {
      amountCad: gap,
      feeCad: fee,
      feeRatePct: Math.round(feeRate * 1000) / 10,
      repaymentDate,
      residualGapCad: withAdvance.cashGapCad,
      historyCount: fin.advances.count,
      historyFeesCad: fin.advances.totalFeesCad,
    },
    shift,
  };
}
