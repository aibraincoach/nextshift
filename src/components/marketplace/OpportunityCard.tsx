"use client";

import Link from "next/link";
import type { MatchScore, Opportunity, OpportunityImpact } from "@/types";
import { fmtDate, fmtHour, fmtMoney, opportunityDate } from "@/lib/engine/plan";
import { primaryReason } from "@/lib/engine/match";

export function hoursLabel(opp: Opportunity): string | null {
  if (opp.startHour == null || opp.endHour == null) return null;
  return `${fmtHour(opp.startHour)}–${fmtHour(opp.endHour)}`;
}

export function OpportunityCard({
  opp,
  score,
  impact,
  demoToday,
  claimed,
  gapDate,
  goalShortfallCad,
}: {
  opp: Opportunity;
  score: MatchScore;
  impact: OpportunityImpact;
  demoToday: string;
  claimed: boolean;
  /** date of the worker's current cash gap, if any (from the base plan) */
  gapDate: string | null;
  /** when set, show goal coverage instead of buffer days */
  goalShortfallCad?: number;
}) {
  const hours = hoursLabel(opp);
  const isJob = opp.type === "job";
  const reducesGap = impact.gapAfterCad < impact.gapBeforeCad;
  const impactLine = isJob
    ? null
    : goalShortfallCad != null && goalShortfallCad > 0 && reducesGap
      ? impact.gapAfterCad === 0
        ? `Closes your goal`
        : `Covers ${Math.min(100, Math.round((impact.netCad / goalShortfallCad) * 100))}% of your goal`
      : impact.closesGap
        ? `Closes your ${gapDate ? fmtDate(gapDate) + " " : ""}gap · +${impact.bufferDaysGained} buffer days`
        : `+${impact.bufferDaysGained} buffer days`;

  const metaParts = [
    opp.employerName,
    fmtDate(opportunityDate(opp, demoToday)),
    hours,
    opp.city,
  ].filter(Boolean);

  return (
    <Link
      href={`/marketplace/${opp.id}`}
      className={`flex gap-4 border-b-2 border-[var(--color-divider)] px-5 py-4 transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] ${
        claimed ? "opacity-70" : ""
      }`}
    >
      <div className="w-10 shrink-0 pt-0.5 text-center">
        <span
          className={`block text-[22px] leading-none tabular-nums ${
            score.total === 100 ? "text-[var(--color-accent-700)]" : "text-[var(--color-text)]"
          }`}
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          {score.total}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className="truncate text-[17px] leading-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            {opp.role}
          </span>
          <span
            className="shrink-0 tabular-nums text-[17px] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            {isJob && opp.weeklyNetCad != null
              ? `${fmtMoney(opp.weeklyNetCad)}/wk`
              : fmtMoney(opp.estimatedNetCad)}
          </span>
        </div>

        <p className="mt-1 text-xs text-muted">{metaParts.join(" · ")}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {claimed ? <span className="tag tag-outline">Claimed</span> : null}
          {impactLine ? (
            <span className={`tag ${impact.closesGap ? "tag-outline" : "tag-neutral"}`}>
              {impactLine}
            </span>
          ) : null}
          {!impactLine && !isJob ? (
            <span className="tag tag-neutral">{primaryReason(score)}</span>
          ) : null}
        </div>

        {opp.type === "released-shift" && opp.releasedBy ? (
          <p className="mt-2 text-xs text-muted">
            Released by {opp.releasedBy}
            {opp.releaseReason ? ` · ${opp.releaseReason}` : ""}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
