"use client";

import type { Opportunity } from "@/types";
import { fmtDate, fmtMoney, opportunityDate } from "@/lib/engine/plan";

function StatusBadge({ claimed }: { claimed: boolean }) {
  return claimed ? (
    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
      Claimed
    </span>
  ) : (
    <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs font-medium text-zinc-400">
      Open
    </span>
  );
}

export function OpenShiftsList({
  opportunities,
  claimedIds,
  demoToday,
}: {
  opportunities: Opportunity[];
  claimedIds: string[];
  demoToday: string;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Open shifts &amp; jobs
      </h2>
      <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
        {opportunities.length === 0 && (
          <p className="px-4 py-6 text-sm text-zinc-500">No open postings yet.</p>
        )}
        {opportunities.map((opp) => (
          <div key={opp.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">{opp.role}</p>
              <p className="text-xs text-zinc-500">
                {opp.type === "job" ? "Job · starts " : ""}
                {fmtDate(opportunityDate(opp, demoToday))} · {opp.city}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-semibold text-zinc-200">
                {fmtMoney(opp.estimatedNetCad)}
                <span className="text-xs font-normal text-zinc-500">
                  {opp.type === "job" ? "/wk" : " net"}
                </span>
              </span>
              <StatusBadge claimed={claimedIds.includes(opp.id)} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReleasedShiftsList({
  opportunities,
  claimedIds,
  demoToday,
}: {
  opportunities: Opportunity[];
  claimedIds: string[];
  demoToday: string;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Released employee shifts
      </h2>
      <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
        {opportunities.length === 0 && (
          <p className="px-4 py-6 text-sm text-zinc-500">
            No shifts have been released to the marketplace.
          </p>
        )}
        {opportunities.map((opp) => (
          <div key={opp.id} className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium text-zinc-100">{opp.role}</p>
              <StatusBadge claimed={claimedIds.includes(opp.id)} />
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">
              {opp.employerName} · {fmtDate(opportunityDate(opp, demoToday))} ·{" "}
              {fmtMoney(opp.estimatedNetCad)} net
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Released by {opp.releasedBy ?? "—"}
              {opp.releaseReason ? ` · ${opp.releaseReason}` : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
