"use client";

import { useMemo } from "react";
import type { AppData } from "@/types";
import { buildCashPlan } from "@/lib/engine/plan";

export interface MarketStats {
  totalWorkers: number;
  withGap: number;
  calgaryWithGap: number;
  /** workerId -> has predicted gap; reused by the post form summary */
  gapByWorker: Map<string, boolean>;
}

export function computeMarketStats(data: AppData): MarketStats {
  const gapByWorker = new Map<string, boolean>();
  let withGap = 0;
  let calgaryWithGap = 0;
  for (const w of data.workers) {
    const fin = data.financials[w.workerId];
    if (!fin) continue;
    const gap = buildCashPlan(fin, data.demoToday).cashGapCad > 0;
    gapByWorker.set(w.workerId, gap);
    if (gap) {
      withGap++;
      if (w.city === "Calgary") calgaryWithGap++;
    }
  }
  return { totalWorkers: data.workers.length, withGap, calgaryWithGap, gapByWorker };
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
      <p className="text-2xl font-semibold text-zinc-100">{value}</p>
      <p className="mt-1 text-xs leading-snug text-zinc-500">{label}</p>
    </div>
  );
}

export function MarketSnapshot({ data }: { data: AppData }) {
  const stats = useMemo(() => computeMarketStats(data), [data]);

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Labour market snapshot
      </h2>
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Workers on platform" value={stats.totalWorkers} />
        <StatTile label="Predicted cash gap within 7 days" value={stats.withGap} />
        <StatTile label="In Calgary with a gap" value={stats.calgaryWithGap} />
      </div>
      <p className="mt-2 text-xs text-zinc-600">
        Aggregate counts only. Workers&apos; budgets are never shared.
      </p>
    </section>
  );
}
