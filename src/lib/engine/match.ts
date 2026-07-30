import type { MatchScore, Opportunity, Worker, WorkerFinancials } from "@/types";
import { fmtDate, opportunityDate, opportunityImpact, type PlanOptions } from "./plan";

const RELATED_ROLES: Record<string, string[]> = {
  "Gig delivery driver": ["Rideshare driver", "Moving helper"],
  "Rideshare driver": ["Gig delivery driver", "Moving helper"],
  "Cleaning / janitorial": ["Hotel housekeeping", "Event / venue staff"],
  "Hotel housekeeping": ["Cleaning / janitorial"],
  "Warehouse associate": ["Moving helper", "Retail associate", "Construction labourer"],
  "Event / venue staff": ["Server / bartender", "Retail associate", "Hotel housekeeping"],
  "Security guard": ["Event / venue staff"],
  "Food service / kitchen": ["Server / bartender"],
  "Server / bartender": ["Food service / kitchen", "Event / venue staff"],
  "Moving helper": ["Warehouse associate", "Construction labourer"],
};

/**
 * Transparent matching engine (not ML): 40% gap coverage, 20% role,
 * 15% city, 15% availability, 10% payout speed.
 */
export function scoreOpportunity(
  worker: Worker,
  fin: WorkerFinancials,
  demoToday: string,
  opp: Opportunity,
  baseOpts: PlanOptions = {}
): MatchScore {
  const impact = opportunityImpact(fin, demoToday, opp, baseOpts);
  const reasons: string[] = [];

  let gapCoverage: number;
  if (impact.gapBeforeCad === 0) {
    gapCoverage = 20; // no gap: money is still useful, but not urgent
    reasons.push("No current shortfall; this adds buffer");
  } else {
    const covered = Math.min(1, opp.estimatedNetCad / impact.gapBeforeCad);
    gapCoverage = Math.round(covered * 40);
    if (impact.closesGap) reasons.push("Closes your cash gap completely");
    else if (covered > 0.5) reasons.push(`Covers ${Math.round(covered * 100)}% of your gap`);
  }

  const occupations = opp.requiredOccupations ?? [];
  let roleMatch = 8;
  if (occupations.length === 0 || occupations.includes(worker.occupation)) {
    roleMatch = 20;
    reasons.push("Matches your role");
  } else if (occupations.some((o) => (RELATED_ROLES[worker.occupation] ?? []).includes(o))) {
    roleMatch = 14;
    reasons.push("Related to your role");
  }

  const cityMatch = opp.city === worker.city ? 15 : 4;
  if (opp.city === worker.city) reasons.push(`In ${worker.city}`);

  // Availability: conflict if the worker already has an assigned shift that day.
  const oppDate = opportunityDate(opp, demoToday);
  const conflict = fin.assignedShifts.some((s) => s.date === oppDate);
  const availabilityMatch = opp.type === "job" ? 12 : conflict ? 2 : 15;
  if (conflict && opp.type !== "job") reasons.push("Conflicts with an existing shift");

  const payoutSpeed = opp.payoutDaysAfter === 0 ? 10 : opp.payoutDaysAfter <= 2 ? 7 : 3;
  if (opp.payoutDaysAfter === 0) reasons.push("Pays same day");

  if (impact.gapBeforeCad > 0 && impact.closesGap) {
    reasons.push(`Adds ${impact.bufferDaysGained} buffer days`);
  }

  return {
    total: Math.min(100, gapCoverage + roleMatch + cityMatch + availabilityMatch + payoutSpeed),
    gapCoverage,
    roleMatch,
    cityMatch,
    availabilityMatch,
    payoutSpeed,
    reasons,
  };
}

export function primaryReason(score: MatchScore): string {
  return score.reasons[0] ?? "Available near you";
}

export function jobMonthlySurplus(fin: WorkerFinancials, weeklyNetCad: number): number {
  const monthlyObligations = fin.obligations.reduce((s, o) => {
    const factor =
      o.frequency === "monthly" ? 1 : o.frequency === "biweekly" ? 26 / 12 : o.frequency === "weekly" ? 52 / 12 : 1;
    return s + o.amountCad * factor;
  }, 0);
  const monthlySpend = fin.avgDailyEssentialSpendCad * 30;
  // 4.33 (~52/12) weeks/month and 26/12 biweekly periods/month are both
  // deliberate approximations; keep them in sync if you change either.
  return Math.round(weeklyNetCad * 4.33 - monthlyObligations - monthlySpend);
}

export { fmtDate };
