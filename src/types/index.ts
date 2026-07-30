export interface Worker {
  workerId: string;
  city: string;
  province: string;
  occupation: string;
  payType: string;
  typicalDailyNetCad: number;
  incomeVolatility: number;
  tipShare: number;
  householdSize: number;
  dependents: number;
  hasBankAccount: boolean;
  usesPrepaidCard: boolean;
  primaryEmployerId: string;
  tenureMonths: number;
  hasSideGig: boolean;
  commuteMode: string;
  rentBurdenBand: string;
}

export interface Obligation {
  obligationId: string;
  workerId: string;
  name: string;
  category: string;
  amountCad: number;
  frequency: string;
  dueDayOfMonth: number;
  autopay: boolean;
  essential: boolean;
}

export interface EarningDay {
  date: string;
  netCad: number;
  grossCad: number;
  hours: number;
  employerId: string;
}

export interface AdvanceStats {
  count: number;
  totalAmountCad: number;
  totalFeesCad: number;
  avgFeeRate: number; // fee / amount
  outstandingCad: number;
  lastReason: string | null;
}

export interface AssignedShift {
  id: string;
  employerId: string;
  employerName: string;
  role: string;
  date: string; // ISO date
  startHour: number;
  endHour: number;
  estimatedNetCad: number;
}

export interface WorkerFinancials {
  workerId: string;
  latestBalanceCad: number;
  latestBalanceDate: string;
  avgDailyEssentialSpendCad: number;
  expectedDailyNetCad: number; // avg net across all recent days incl. non-worked
  workDaysPerWeek: number;
  obligations: Obligation[];
  recentEarnings: EarningDay[];
  advances: AdvanceStats;
  assignedShifts: AssignedShift[]; // synthetic future shifts for the demo
}

export interface Opportunity {
  id: string;
  type: "shift" | "job" | "released-shift";
  employerId: string;
  employerName: string;
  role: string;
  city: string;
  dayOffset: number; // days from demoToday; jobs use start-of-work offset
  startHour?: number;
  endHour?: number;
  hourlyRateCad?: number;
  estimatedNetCad: number; // per shift; for jobs, weekly net
  weeklyNetCad?: number; // jobs only
  requiredOccupations?: string[];
  payoutDaysAfter: number; // 0 = same day
  releasedBy?: string; // initials, released shifts only
  releaseReason?: string;
  note?: string;
}

export interface AppData {
  demoToday: string;
  personaIds: string[];
  workers: Worker[];
  financials: Record<string, WorkerFinancials>;
}

export interface DayProjection {
  date: string;
  earningsCad: number;
  obligationsCad: number;
  obligationNames: string[];
  essentialSpendCad: number;
  endingBalanceCad: number;
}

export interface CashPlan {
  currentBalanceCad: number;
  bufferTargetCad: number;
  projection: DayProjection[];
  lowestBalanceCad: number;
  lowestBalanceDate: string;
  cashGapCad: number; // max(0, buffer - lowest)
  gapDate: string | null;
  upcomingObligations: { name: string; amountCad: number; date: string; essential: boolean }[];
  safeToSaveTodayCad: number;
}

export interface OpportunityImpact {
  netCad: number;
  gapBeforeCad: number;
  gapAfterCad: number;
  bufferDaysGained: number;
  closesGap: boolean;
}

export interface MatchScore {
  total: number; // 0-100
  gapCoverage: number;
  roleMatch: number;
  cityMatch: number;
  availabilityMatch: number;
  payoutSpeed: number;
  reasons: string[];
}
