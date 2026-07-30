import type {
  CashPlan,
  DayProjection,
  Obligation,
  Opportunity,
  OpportunityImpact,
  WorkerFinancials,
} from "@/types";

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function fmtDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function fmtMoney(v: number): string {
  return v.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });
}

/** Expand monthly/biweekly/weekly obligations into concrete due dates. */
export function obligationDates(
  obligations: Obligation[],
  fromIso: string,
  days: number
): { name: string; amountCad: number; date: string; essential: boolean }[] {
  const out: { name: string; amountCad: number; date: string; essential: boolean }[] = [];
  for (let i = 0; i < days; i++) {
    const iso = addDays(fromIso, i);
    const d = new Date(iso + "T12:00:00");
    for (const o of obligations) {
      const due =
        o.frequency === "monthly"
          ? d.getDate() === Math.min(o.dueDayOfMonth, 28)
          : o.frequency === "biweekly"
            ? d.getDate() === o.dueDayOfMonth || d.getDate() === ((o.dueDayOfMonth + 13) % 28) + 1
            : o.frequency === "weekly"
              ? d.getDay() === o.dueDayOfMonth % 7
              : d.getDate() === o.dueDayOfMonth;
      if (due) out.push({ name: o.name, amountCad: o.amountCad, date: iso, essential: o.essential });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export interface PlanOptions {
  /** net pay landing on specific dates from claimed opportunities */
  extraIncome?: { date: string; netCad: number }[];
  /** net pay removed on specific dates from released shifts */
  removedIncome?: { date: string; netCad: number }[];
  savingsRate?: number; // 0..1, applied to expected daily earnings
  horizonDays?: number;
}

export function buildCashPlan(
  fin: WorkerFinancials,
  demoToday: string,
  opts: PlanOptions = {}
): CashPlan {
  const horizon = opts.horizonDays ?? 7;
  const bufferTargetCad = Math.max(40, Math.round(fin.avgDailyEssentialSpendCad * 2 + 40));
  const dueDates = obligationDates(fin.obligations, demoToday, horizon);
  const upcoming30 = obligationDates(fin.obligations, demoToday, 30);

  const extraByDate = new Map<string, number>();
  for (const e of opts.extraIncome ?? []) {
    extraByDate.set(e.date, (extraByDate.get(e.date) ?? 0) + e.netCad);
  }
  for (const r of opts.removedIncome ?? []) {
    extraByDate.set(r.date, (extraByDate.get(r.date) ?? 0) - r.netCad);
  }

  const savingsRate = opts.savingsRate ?? 0;
  const projection: DayProjection[] = [];
  let balance = fin.latestBalanceCad;
  // The gap is measured from tomorrow onward: today's balance is a fact the
  // worker can't change, but upcoming days are where earnings can land.
  let lowest = Number.POSITIVE_INFINITY;
  let lowestDate = demoToday;

  for (let i = 0; i < horizon; i++) {
    const date = addDays(demoToday, i);
    // Conservative baseline: expected daily net scaled down for volatility is
    // already averaged over worked and unworked days in the last 28 days.
    const baseEarn = fin.expectedDailyNetCad * (1 - savingsRate);
    const extra = extraByDate.get(date) ?? 0;
    const dayObls = dueDates.filter((o) => o.date === date);
    const oblTotal = dayObls.reduce((s, o) => s + o.amountCad, 0);
    const spend = fin.avgDailyEssentialSpendCad;
    balance = balance + baseEarn + extra - oblTotal - spend;
    projection.push({
      date,
      earningsCad: Math.round((baseEarn + extra) * 100) / 100,
      obligationsCad: oblTotal,
      obligationNames: dayObls.map((o) => o.name),
      essentialSpendCad: spend,
      endingBalanceCad: Math.round(balance * 100) / 100,
    });
    if (i >= 1 && balance < lowest) {
      lowest = balance;
      lowestDate = date;
    }
  }

  const cashGapCad = Math.max(0, Math.round((bufferTargetCad - lowest) * 100) / 100);
  const gapDate = cashGapCad > 0 ? lowestDate : null;

  // Safe to save today: what can be set aside while every projected day stays
  // at or above the buffer target.
  const headroom = lowest - bufferTargetCad;
  const safeToSaveTodayCad =
    headroom > 0 ? Math.max(0, Math.min(Math.round(headroom * 0.25), Math.round(fin.expectedDailyNetCad * 0.1))) : 0;

  return {
    currentBalanceCad: fin.latestBalanceCad,
    bufferTargetCad,
    projection,
    lowestBalanceCad: Math.round(lowest * 100) / 100,
    lowestBalanceDate: lowestDate,
    cashGapCad,
    gapDate,
    upcomingObligations: upcoming30,
    safeToSaveTodayCad,
  };
}

export function opportunityDate(opp: Opportunity, demoToday: string): string {
  return addDays(demoToday, opp.dayOffset);
}

export function opportunityPayoutDate(opp: Opportunity, demoToday: string): string {
  return addDays(demoToday, opp.dayOffset + opp.payoutDaysAfter);
}

export function opportunityImpact(
  fin: WorkerFinancials,
  demoToday: string,
  opp: Opportunity,
  baseOpts: PlanOptions = {}
): OpportunityImpact {
  const before = buildCashPlan(fin, demoToday, baseOpts);
  const payoutDate = opportunityPayoutDate(opp, demoToday);
  const after = buildCashPlan(fin, demoToday, {
    ...baseOpts,
    extraIncome: [...(baseOpts.extraIncome ?? []), { date: payoutDate, netCad: opp.estimatedNetCad }],
  });
  const spend = Math.max(1, fin.avgDailyEssentialSpendCad);
  return {
    netCad: opp.estimatedNetCad,
    gapBeforeCad: before.cashGapCad,
    gapAfterCad: after.cashGapCad,
    bufferDaysGained: Math.round((opp.estimatedNetCad / spend) * 10) / 10,
    closesGap: before.cashGapCad > 0 && after.cashGapCad === 0,
  };
}

/** Impact of releasing an assigned shift: negative income on that date. */
export function releaseImpact(
  fin: WorkerFinancials,
  demoToday: string,
  shiftDate: string,
  netCad: number,
  baseOpts: PlanOptions = {}
): { gapBeforeCad: number; gapAfterCad: number; createsGap: boolean; gapDate: string | null } {
  const before = buildCashPlan(fin, demoToday, baseOpts);
  const after = buildCashPlan(fin, demoToday, {
    ...baseOpts,
    removedIncome: [...(baseOpts.removedIncome ?? []), { date: shiftDate, netCad }],
  });
  return {
    gapBeforeCad: before.cashGapCad,
    gapAfterCad: after.cashGapCad,
    createsGap: after.cashGapCad > before.cashGapCad,
    gapDate: after.gapDate,
  };
}
