"use client";

import { AdvanceVsShift } from "@/components/dashboard/AdvanceVsShift";
import { BudgetSummary } from "@/components/dashboard/BudgetSummary";
import { CashGapHero } from "@/components/dashboard/CashGapHero";
import { CloseThisGap } from "@/components/dashboard/CloseThisGap";
import { DailyShortfalls } from "@/components/dashboard/DailyShortfalls";
import { GoalSetter } from "@/components/dashboard/GoalSetter";
import { EmptyWorker, ErrorPlan, LoadingPlan } from "@/components/dashboard/PageStatus";
import { RunwayChart } from "@/components/dashboard/RunwayChart";
import { UpcomingObligations } from "@/components/dashboard/UpcomingObligations";
import { useAppData } from "@/lib/data/useAppData";
import { buildCashPlan } from "@/lib/engine/plan";

export default function DashboardPage() {
  const { loading, error, worker, financials, demoToday, planOptions, opportunities } =
    useAppData();

  if (loading) return <LoadingPlan />;
  if (error) return <ErrorPlan message={error} />;
  if (!worker || !financials) return <EmptyWorker />;

  const plan = buildCashPlan(financials, demoToday, planOptions);
  const dailySpendCad =
    planOptions.needs?.dailySpendCad ?? financials.avgDailyEssentialSpendCad;

  return (
    <div className="pb-2">
      <CashGapHero plan={plan} />

      <hr className="section-rule" />

      <BudgetSummary plan={plan} dailySpendCad={dailySpendCad} />

      <hr className="section-rule" />

      <GoalSetter
        workerId={worker.workerId}
        financials={financials}
        demoToday={demoToday}
        planOptions={planOptions}
      />

      <hr className="section-rule" />

      <DailyShortfalls plan={plan} />

      <hr className="section-rule" />

      <RunwayChart projection={plan.projection} bufferTargetCad={plan.bufferTargetCad} />

      <hr className="section-rule" />

      <UpcomingObligations upcoming={plan.upcomingObligations} />

      <hr className="section-rule" />

      <CloseThisGap
        worker={worker}
        financials={financials}
        demoToday={demoToday}
        opportunities={opportunities}
        planOptions={planOptions}
        plan={plan}
      />

      <hr className="section-rule" />

      <AdvanceVsShift
        worker={worker}
        financials={financials}
        demoToday={demoToday}
        opportunities={opportunities}
        planOptions={planOptions}
      />
    </div>
  );
}
