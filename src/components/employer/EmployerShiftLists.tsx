"use client";

import type { Opportunity } from "@/types";
import { fmtDate, fmtMoney, opportunityDate } from "@/lib/engine/plan";

function StatusBadge({ claimed }: { claimed: boolean }) {
  return claimed ? (
    <span className="tag tag-outline">Claimed</span>
  ) : (
    <span className="tag tag-neutral">Open</span>
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
    <section className="mb-6 px-5">
      <h2
        className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[var(--color-accent-700)]"
        style={{ fontWeight: 800 }}
      >
        Open shifts &amp; jobs
      </h2>
      <div className="border-2 border-[var(--color-divider)]">
        {opportunities.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted">No open postings yet.</p>
        )}
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            className="flex items-center justify-between gap-3 border-b border-[var(--color-divider)] px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p
                className="truncate text-sm text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
              >
                {opp.role}
              </p>
              <p className="text-xs text-muted">
                {opp.type === "job" ? "Job · starts " : ""}
                {fmtDate(opportunityDate(opp, demoToday))} · {opp.city}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className="text-sm tabular-nums text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
              >
                {fmtMoney(opp.estimatedNetCad)}
                <span className="text-xs font-normal text-muted">
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
    <section className="mb-6 px-5">
      <h2
        className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[var(--color-accent-700)]"
        style={{ fontWeight: 800 }}
      >
        Released employee shifts
      </h2>
      <div className="border-2 border-[var(--color-divider)]">
        {opportunities.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted">
            No shifts have been released to the marketplace.
          </p>
        )}
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            className="border-b border-[var(--color-divider)] px-4 py-3 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className="truncate text-sm text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
              >
                {opp.role}
              </p>
              <StatusBadge claimed={claimedIds.includes(opp.id)} />
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {opp.employerName} · {fmtDate(opportunityDate(opp, demoToday))} ·{" "}
              {fmtMoney(opp.estimatedNetCad)} net
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Released by {opp.releasedBy ?? "—"}
              {opp.releaseReason ? ` · ${opp.releaseReason}` : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
