"use client";

import { useAppData } from "@/lib/data/useAppData";
import { useDemoState } from "@/lib/storage/demoState";
import { EmployerHeader } from "@/components/employer/EmployerHeader";
import { OpenShiftsList, ReleasedShiftsList } from "@/components/employer/EmployerShiftLists";
import { MarketSnapshot } from "@/components/employer/MarketSnapshot";

export default function EmployerPage() {
  const { loading, error, data, opportunities, demoToday } = useAppData();
  const { state } = useDemoState();

  if (loading) {
    return <p className="py-16 text-center text-sm text-zinc-500">Loading employer dashboard…</p>;
  }
  if (error || !data) {
    return (
      <p className="py-16 text-center text-sm text-amber-400">
        Could not load data. {error ?? ""}
      </p>
    );
  }

  const openShifts = opportunities.filter(
    (o) =>
      (o.employerId === "EMP-901" || o.employerId === "EMP-POSTED") &&
      o.type !== "released-shift"
  );
  const releasedShifts = opportunities.filter((o) => o.type === "released-shift");

  return (
    <div>
      <EmployerHeader />
      <OpenShiftsList
        opportunities={openShifts}
        claimedIds={state.claimedOpportunityIds}
        demoToday={demoToday}
      />
      <ReleasedShiftsList
        opportunities={releasedShifts}
        claimedIds={state.claimedOpportunityIds}
        demoToday={demoToday}
      />
      <MarketSnapshot data={data} />
    </div>
  );
}
