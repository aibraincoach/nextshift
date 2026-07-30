"use client";

import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import type { MatchScore, Opportunity, OpportunityImpact } from "@/types";
import { fmtDate, fmtMoney, opportunityDate } from "@/lib/engine/plan";
import { primaryReason } from "@/lib/engine/match";

function fmtHour(h: number): string {
  // Hours >= 24 mean the shift runs past midnight (e.g. 29 = 5 AM next day).
  const day = h % 24;
  const hr = day % 12 === 0 ? 12 : day % 12;
  return `${hr}${day < 12 ? " AM" : " PM"}`;
}

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
}: {
  opp: Opportunity;
  score: MatchScore;
  impact: OpportunityImpact;
  demoToday: string;
  claimed: boolean;
  /** date of the worker's current cash gap, if any (from the base plan) */
  gapDate: string | null;
}) {
  const hours = hoursLabel(opp);
  const isJob = opp.type === "job";
  const impactLine = isJob
    ? null
    : impact.closesGap
      ? `Closes your ${gapDate ? fmtDate(gapDate) + " " : ""}gap · +${impact.bufferDaysGained} buffer days`
      : `+${impact.bufferDaysGained} buffer days`;

  return (
    <Link
      href={`/marketplace/${opp.id}`}
      className={`block rounded-xl border bg-zinc-900/60 p-4 transition hover:border-zinc-600 ${
        claimed ? "border-emerald-800/60 opacity-80" : "border-zinc-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-100">{opp.role}</div>
          <div className="truncate text-xs text-zinc-400">{opp.employerName}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {claimed ? (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              Claimed
            </span>
          ) : null}
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-300">
            {score.total}% match
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {fmtDate(opportunityDate(opp, demoToday))}
          {hours ? ` · ${hours}` : ""}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {opp.city}
        </span>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-lg font-bold tabular-nums text-zinc-100">
          {isJob && opp.weeklyNetCad != null
            ? `${fmtMoney(opp.weeklyNetCad)}/wk net`
            : `${fmtMoney(opp.estimatedNetCad)} net`}
        </span>
        <span className="text-right text-xs text-zinc-400">{primaryReason(score)}</span>
      </div>

      {impactLine ? (
        <div
          className={`mt-1 text-xs ${impact.closesGap ? "font-medium text-emerald-400" : "text-zinc-500"}`}
        >
          {impactLine}
        </div>
      ) : null}

      {opp.type === "released-shift" && opp.releasedBy ? (
        <div className="mt-2 flex items-center gap-2 border-t border-zinc-800 pt-2 text-xs text-zinc-500">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-300">
            {opp.releasedBy.slice(0, 2).toUpperCase()}
          </span>
          <span>
            Released by {opp.releasedBy}
            {opp.releaseReason ? ` · ${opp.releaseReason}` : ""}
          </span>
        </div>
      ) : null}
    </Link>
  );
}
