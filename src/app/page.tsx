"use client";

import { AdvanceVsShift } from "@/components/dashboard/AdvanceVsShift";
import { CashGapHero } from "@/components/dashboard/CashGapHero";
import { EmptyWorker, ErrorPlan, LoadingPlan } from "@/components/dashboard/PageStatus";
import { RunwayChart } from "@/components/dashboard/RunwayChart";
import { UpcomingObligations } from "@/components/dashboard/UpcomingObligations";
import { DemoResetButton } from "@/components/shared/DemoResetButton";
import { MetricCard } from "@/components/shared/MetricCard";
import { WorkerSwitcher } from "@/components/shared/WorkerSwitcher";
import { useAppData } from "@/lib/data/useAppData";
import { buildCashPlan, fmtDate, fmtMoney } from "@/lib/engine/plan";

function runwayLabel(
  projection: ReturnType<typeof buildCashPlan>["projection"],
  bufferTargetCad: number
): string {
  const idx = projection.findIndex((d) => d.endingBalanceCad < bufferTargetCad);
  if (idx === -1) return "7+ days";
  if (idx === 0) return "0 days";
  return `${idx} day${idx === 1 ? "" : "s"}`;
}

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
  const nextObl = plan.upcomingObligations[0];
  const runway = runwayLabel(plan.projection, plan.bufferTargetCad);
  const runwayTone =
    runway === "7+ days" ? "good" : runway === "0 days" ? "bad" : ("warn" as const);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <WorkerSwitcher />
        <DemoResetButton />
      </div>

      <CashGapHero plan={plan} />

      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Available now"
          value={fmtMoney(plan.currentBalanceCad)}
          tone={plan.currentBalanceCad < 0 ? "bad" : "neutral"}
        />
        <MetricCard
          label="Next obligation"
          value={nextObl ? fmtMoney(nextObl.amountCad) : "—"}
          sub={nextObl ? `${nextObl.name} · ${fmtDate(nextObl.date)}` : "None soon"}
        />
        <MetricCard label="Runway" value={runway} tone={runwayTone} sub="Until below buffer" />
        <MetricCard
          label="Earnings needed"
          value={fmtMoney(plan.cashGapCad)}
          tone={plan.cashGapCad > 0 ? "warn" : "good"}
          sub={plan.gapDate ? `by ${fmtDate(plan.gapDate)}` : "Gap closed"}
        />
        <MetricCard
          label="Safe to save today"
          value={fmtMoney(plan.safeToSaveTodayCad)}
          tone={plan.safeToSaveTodayCad > 0 ? "good" : "neutral"}
          sub="Keeps bills covered"
        />
      </div>

      <RunwayChart projection={plan.projection} bufferTargetCad={plan.bufferTargetCad} />

      <UpcomingObligations upcoming={plan.upcomingObligations} />

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
