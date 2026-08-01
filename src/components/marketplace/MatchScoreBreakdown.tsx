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
    <section className="px-5 py-5">
      <div className="flex items-baseline justify-between">
        <h2
          className="text-[17px] text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Match score
        </h2>
        <span
          className="text-[22px] tabular-nums text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          {score.total}/100
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {PARTS.map(({ key, label, max }) => {
          const v = score[key] as number;
          return (
            <div key={key}>
              <div className="flex justify-between text-xs text-muted">
                <span>{label}</span>
                <span className="tabular-nums">
                  {v}/{max}
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-[var(--color-neutral-300)]">
                <div
                  className="h-1.5 bg-[var(--color-text)]"
                  style={{ width: `${Math.round((v / max) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] text-muted">
        Transparent matching engine — no black box. Scores reflect your real cash-flow gap.
      </p>
    </section>
  );
}
