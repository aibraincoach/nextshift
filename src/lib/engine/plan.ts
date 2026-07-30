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

export function fmtHour(h: number): string {
  // Hours >= 24 mean the shift runs past midnight (e.g. 29 = 5 AM next day).
  const day = h % 24;
  const hr = day % 12 === 0 ? 12 : day % 12;
  return `${hr}${day < 12 ? " AM" : " PM"}`;
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
  // Biweekly obligations are anchored to their due day in the starting month,
  // then recur every 14 days, so they stay correct across month boundaries.
  const biweeklyAnchor = (o: Obligation): number => {
    const from = new Date(fromIso + "T12:00:00");
    const anchor = new Date(from.getFullYear(), from.getMonth(), Math.min(o.dueDayOfMonth, 28), 12);
    while (anchor > from) anchor.setDate(anchor.getDate() - 14);
    return anchor.getTime();
  };
  const anchors = new Map<string, number>();
  for (const o of obligations) {
    if (o.frequency === "biweekly") anchors.set(o.obligationId, biweeklyAnchor(o));
  }
  for (let i = 0; i < days; i++) {
    const iso = addDays(fromIso, i);
    const d = new Date(iso + "T12:00:00");
    for (const o of obligations) {
      const due =
        o.frequency === "biweekly"
          ? Math.round((d.getTime() - (anchors.get(o.obligationId) ?? d.getTime())) / 86400000) % 14 === 0
          : o.frequency === "weekly"
            ? d.getDay() === o.dueDayOfMonth % 7
            : d.getDate() === Math.min(o.dueDayOfMonth, 28);
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
  /** User-set needs (budget-first): override the derived defaults. */
  needs?: NeedsSettings;
}

export interface NeedsSettings {
  /** Safety buffer expressed in days of everyday spending (default 2). */
  bufferDays?: number;
  /** Override for average daily everyday spending, CAD. */
  dailySpendCad?: number;
  /** Obligation IDs the user has toggled off (paused/not mine). */
  excludedObligationIds?: string[];
  /** Override for expected daily net income, CAD (history only prefills). */
  expectedDailyNetCad?: number;
  /** The user's stated goal: "I need $X by DATE". */
  goalAmountCad?: number;
  goalByDate?: string; // ISO date
}

export function buildCashPlan(
  fin: WorkerFinancials,
  demoToday: string,
  opts: PlanOptions = {}
): CashPlan {
  const needs = opts.needs ?? {};
  const goalActive = needs.goalAmountCad != null && needs.goalAmountCad > 0 && !!needs.goalByDate;
  // Extend the horizon to cover the goal date so the goal is always evaluated.
  const goalDays = goalActive
    ? Math.max(1, Math.round((new Date(needs.goalByDate! + "T12:00:00").getTime() - new Date(demoToday + "T12:00:00").getTime()) / 86400000) + 1)
    : 0;
  const horizon = Math.max(opts.horizonDays ?? 7, goalDays);
  const dailySpend =
    needs.dailySpendCad != null && needs.dailySpendCad >= 0
      ? needs.dailySpendCad
      : fin.avgDailyEssentialSpendCad;
  const bufferDays = needs.bufferDays ?? 2;
  // The buffer is exactly what the user asked for: bufferDays worth of their
  // daily spending. No hidden padding — the user sets the budget.
  const bufferTargetCad = Math.round(dailySpend * bufferDays * 100) / 100;
  const excluded = new Set(needs.excludedObligationIds ?? []);
  const activeObligations = fin.obligations.filter((o) => !excluded.has(o.obligationId));
  const dueDates = obligationDates(activeObligations, demoToday, horizon);
  const upcoming30 = obligationDates(activeObligations, demoToday, 30);

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
    const baseEarn = (needs.expectedDailyNetCad ?? fin.expectedDailyNetCad) * (1 - savingsRate);
    const extra = extraByDate.get(date) ?? 0;
    const dayObls = dueDates.filter((o) => o.date === date);
    const oblTotal = dayObls.reduce((s, o) => s + o.amountCad, 0);
    const spend = dailySpend;
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

  if (!Number.isFinite(lowest)) lowest = balance;
  const bufferGapCad = Math.max(0, Math.round((bufferTargetCad - lowest) * 100) / 100);

  // User goal: "I need $X available by DATE". Shortfall is measured against
  // the projected balance on that date. When a goal is set it becomes the
  // primary gap so matching and impacts optimize for what the user asked.
  let goal: CashPlan["goal"];
  if (goalActive) {
    const goalDay = projection.find((p) => p.date === needs.goalByDate) ?? projection[projection.length - 1];
    const shortfall = Math.max(0, Math.round((needs.goalAmountCad! - goalDay.endingBalanceCad) * 100) / 100);
    goal = {
      amountCad: needs.goalAmountCad!,
      byDate: needs.goalByDate!,
      projectedBalanceCad: goalDay.endingBalanceCad,
      shortfallCad: shortfall,
      onTrack: shortfall === 0,
    };
  }

  const cashGapCad = goal ? goal.shortfallCad : bufferGapCad;
  const gapDate = goal
    ? goal.shortfallCad > 0
      ? goal.byDate
      : null
    : bufferGapCad > 0
      ? lowestDate
      : null;

  // Safe to save today: what can be set aside while every projected day stays
  // at or above the buffer target. Never suggest saving while the user is
  // short on their stated goal.
  const headroom = goal && goal.shortfallCad > 0 ? 0 : lowest - bufferTargetCad;
  const safeToSaveTodayCad =
    headroom > 0
      ? Math.max(
          0,
          Math.min(
            Math.round(headroom * 0.25),
            Math.round((needs.expectedDailyNetCad ?? fin.expectedDailyNetCad) * 0.1)
          )
        )
      : 0;

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
    goal,
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
  // Floor at $5/day so near-zero spenders don't show absurd buffer-day gains.
  const spend = Math.max(5, fin.avgDailyEssentialSpendCad);
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
