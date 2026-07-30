"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/lib/data/useAppData";
import { useDemoState } from "@/lib/storage/demoState";
import { scoreOpportunity } from "@/lib/engine/match";
import { buildCashPlan, opportunityImpact } from "@/lib/engine/plan";
import { OpportunityCard } from "@/components/marketplace/OpportunityCard";
import { WorkerSwitcher } from "@/components/shared/WorkerSwitcher";
import type { Opportunity } from "@/types";

const TABS: { key: Opportunity["type"]; label: string }[] = [
  { key: "shift", label: "Shifts" },
  { key: "job", label: "Jobs" },
  { key: "released-shift", label: "Shift swaps" },
];

const EMPTY_COPY: Record<Opportunity["type"], string> = {
  shift: "No open shifts right now. Check back soon.",
  job: "No jobs posted right now.",
  "released-shift": "No coworker-released shifts right now.",
};

export default function MarketplacePage() {
  const { loading, error, opportunities, worker, financials, demoToday, planOptions } =
    useAppData();
  const { state } = useDemoState();
  const [tab, setTab] = useState<Opportunity["type"]>("shift");

  const gapDate = useMemo(
    () => (financials ? buildCashPlan(financials, demoToday, planOptions).gapDate : null),
    [financials, demoToday, planOptions]
  );

  const scored = useMemo(() => {
    if (!worker || !financials) return [];
    return opportunities
      .filter((o) => o.type === tab)
      .map((opp) => ({
        opp,
        score: scoreOpportunity(worker, financials, demoToday, opp, planOptions),
        impact: opportunityImpact(financials, demoToday, opp, planOptions),
        claimed: state.claimedOpportunityIds.includes(opp.id),
      }))
      .sort((a, b) => {
        if (a.claimed !== b.claimed) return a.claimed ? 1 : -1;
        return b.score.total - a.score.total;
      });
  }, [opportunities, worker, financials, demoToday, planOptions, tab, state.claimedOpportunityIds]);

  if (loading) {
    return <p className="py-16 text-center text-sm text-zinc-500">Loading marketplace…</p>;
  }
  if (error) {
    return <p className="py-16 text-center text-sm text-rose-400">Something went wrong: {error}</p>;
  }
  if (!worker || !financials) {
    return <p className="py-16 text-center text-sm text-zinc-500">No worker selected.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-zinc-100">Find work</h1>
        <p className="text-xs text-zinc-500">Ranked by how well each one improves your runway.</p>
      </div>

      <WorkerSwitcher />

      <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
              tab === t.key ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {scored.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">{EMPTY_COPY[tab]}</p>
      ) : (
        <div className="space-y-3">
          {scored.map(({ opp, score, impact, claimed }) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              score={score}
              impact={impact}
              demoToday={demoToday}
              claimed={claimed}
              gapDate={gapDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
