"use client";

import { AdvanceVsShift } from "@/components/dashboard/AdvanceVsShift";
import { BudgetSummary } from "@/components/dashboard/BudgetSummary";
import { CashGapHero } from "@/components/dashboard/CashGapHero";
import { CloseThisGap } from "@/components/dashboard/CloseThisGap";
import { EmptyWorker, ErrorPlan, LoadingPlan } from "@/components/dashboard/PageStatus";
import { RunwayChart } from "@/components/dashboard/RunwayChart";
import { UpcomingObligations } from "@/components/dashboard/UpcomingObligations";
import { DemoResetButton } from "@/components/shared/DemoResetButton";
import { WorkerSwitcher } from "@/components/shared/WorkerSwitcher";
import { useAppData } from "@/lib/data/useAppData";
import { buildCashPlan } from "@/lib/engine/plan";

export default function DashboardPage() {
  const { loading, error, worker, financials, demoToday, planOptions, opportunities } =
    useAppData();

  if (loading) return <LoadingPlan />;
  if (error) return <ErrorPlan message={error} />;
  if (!worker || !financials) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <WorkerSwitcher />
          <DemoResetButton />
        </div>
        <EmptyWorker />
      </div>
    );
  }

  const plan = buildCashPlan(financials, demoToday, planOptions);
  const dailySpendCad =
    planOptions.needs?.dailySpendCad ?? financials.avgDailyEssentialSpendCad;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <WorkerSwitcher />
        <DemoResetButton />
      </div>

      <BudgetSummary plan={plan} dailySpendCad={dailySpendCad} />

      <CashGapHero plan={plan} />

      <RunwayChart projection={plan.projection} bufferTargetCad={plan.bufferTargetCad} />

      <UpcomingObligations upcoming={plan.upcomingObligations} />

      <CloseThisGap
        worker={worker}
        financials={financials}
        demoToday={demoToday}
        opportunities={opportunities}
        planOptions={planOptions}
        gapCad={plan.cashGapCad}
      />

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
