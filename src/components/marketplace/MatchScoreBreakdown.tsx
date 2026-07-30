"use client";

import type { MatchScore } from "@/types";

const PARTS: { key: keyof MatchScore; label: string; max: number }[] = [
  { key: "gapCoverage", label: "Closes your gap", max: 40 },
  { key: "roleMatch", label: "Role match", max: 20 },
  { key: "cityMatch", label: "City match", max: 15 },
  { key: "availabilityMatch", label: "Availability", max: 15 },
  { key: "payoutSpeed", label: "Payout speed", max: 10 },
];

export function MatchScoreBreakdown({ score }: { score: MatchScore }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">Match score</h2>
        <span className="text-lg font-bold tabular-nums text-zinc-100">{score.total}/100</span>
      </div>
      <div className="mt-3 space-y-2.5">
        {PARTS.map(({ key, label, max }) => {
          const v = score[key] as number;
          return (
            <div key={key}>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{label}</span>
                <span className="tabular-nums">
                  {v}/{max}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-zinc-800">
                <div
                  className="h-1.5 rounded-full bg-emerald-500"
                  style={{ width: `${Math.round((v / max) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-zinc-500">
        Transparent matching engine — no black box. Scores reflect your real cash-flow gap.
      </p>
    </div>
  );
}
