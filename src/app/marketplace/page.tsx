"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/lib/data/useAppData";
import { useDemoState } from "@/lib/storage/demoState";
import { scoreOpportunity } from "@/lib/engine/match";
import { buildCashPlan, fmtDate, fmtMoney, opportunityImpact } from "@/lib/engine/plan";
import { OpportunityCard } from "@/components/marketplace/OpportunityCard";
import type { Opportunity } from "@/types";

const TABS: { key: Opportunity["type"]; label: string }[] = [
  { key: "shift", label: "Shifts" },
  { key: "job", label: "Jobs" },
  { key: "released-shift", label: "Swaps" },
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

  const plan = useMemo(
    () => (financials ? buildCashPlan(financials, demoToday, planOptions) : null),
    [financials, demoToday, planOptions]
  );
  const gapDate = plan?.gapDate ?? null;
  const goalShortfallCad =
    plan?.goal && plan.goal.shortfallCad > 0 ? plan.goal.shortfallCad : undefined;

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
    return (
      <p className="px-5 py-16 text-center text-sm text-muted">Loading marketplace…</p>
    );
  }
  if (error) {
    return (
      <p className="px-5 py-16 text-center text-sm text-[var(--color-accent)]">
        Something went wrong: {error}
      </p>
    );
  }
  if (!worker || !financials) {
    return (
      <p className="px-5 py-16 text-center text-sm text-muted">No worker selected.</p>
    );
  }

  return (
    <div className="pb-2">
      <section className="px-5 py-5">
        <h1
          className="text-[28px] leading-none tracking-tight text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Find work
        </h1>
        <p className="mt-2 text-sm text-muted">
          Ranked by how well each one improves your runway.
        </p>
      </section>

      {plan?.goal && plan.goal.shortfallCad > 0 ? (
        <div className="mx-5 mb-4 border-2 border-[var(--color-divider)] bg-[var(--color-surface)] px-4 py-3 text-sm">
          You need{" "}
          <span className="tabular-nums font-semibold">{fmtMoney(plan.goal.shortfallCad)}</span> by{" "}
          {fmtDate(plan.goal.byDate)} — showing work that pays out in time.
        </div>
      ) : null}

      <div className="px-5 pb-4">
        <div className="seg w-full">
          {TABS.map((t) => (
            <label key={t.key} className="seg-opt flex-1 justify-center">
              <input
                type="radio"
                name="marketplace-tab"
                checked={tab === t.key}
                onChange={() => setTab(t.key)}
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="section-rule" />

      {scored.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-muted">{EMPTY_COPY[tab]}</p>
      ) : (
        <div>
          {scored.map(({ opp, score, impact, claimed }) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              score={score}
              impact={impact}
              demoToday={demoToday}
              claimed={claimed}
              gapDate={gapDate}
              goalShortfallCad={goalShortfallCad}
            />
          ))}
        </div>
      )}
    </div>
  );
}
