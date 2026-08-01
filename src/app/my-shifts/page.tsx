"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppData } from "@/lib/data/useAppData";
import { useDemoState } from "@/lib/storage/demoState";
import { fmtDate, fmtHour, fmtMoney, opportunityDate, releaseImpact } from "@/lib/engine/plan";
import { ReleaseShiftDialog } from "@/components/marketplace/ReleaseShiftDialog";
import type { AssignedShift } from "@/types";

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="px-5 text-[10px] uppercase tracking-[0.1em] text-[var(--color-accent-700)]"
      style={{ fontWeight: 800 }}
    >
      {children}
    </h2>
  );
}

export default function MyShiftsPage() {
  const { loading, error, opportunities, financials, demoToday, planOptions } = useAppData();
  const { state, releaseShift, unclaim } = useDemoState();
  const [releasing, setReleasing] = useState<AssignedShift | null>(null);

  const assigned = useMemo(
    () =>
      (financials?.assignedShifts ?? []).filter((s) => !state.releasedShiftIds.includes(s.id)),
    [financials, state.releasedShiftIds]
  );

  const released = useMemo(
    () =>
      (financials?.assignedShifts ?? []).filter((s) => state.releasedShiftIds.includes(s.id)),
    [financials, state.releasedShiftIds]
  );

  const claimed = useMemo(
    () =>
      state.claimedOpportunityIds
        .map((id) => opportunities.find((o) => o.id === id))
        .filter((o): o is NonNullable<typeof o> => o != null),
    [state.claimedOpportunityIds, opportunities]
  );

  const releasingImpact = useMemo(() => {
    if (!releasing || !financials) return null;
    return releaseImpact(
      financials,
      demoToday,
      releasing.date,
      releasing.estimatedNetCad,
      planOptions
    );
  }, [releasing, financials, demoToday, planOptions]);

  if (loading) {
    return <p className="px-5 py-16 text-center text-sm text-muted">Loading your shifts…</p>;
  }
  if (error) {
    return (
      <p className="px-5 py-16 text-center text-sm text-[var(--color-accent-700)]">
        Something went wrong: {error}
      </p>
    );
  }
  if (!financials) {
    return <p className="px-5 py-16 text-center text-sm text-muted">No worker selected.</p>;
  }

  return (
    <div className="pb-2">
      <section className="px-5 py-5">
        <h1
          className="text-[28px] leading-none tracking-tight text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          My shifts
        </h1>
        <p className="mt-2 text-sm text-muted">Assigned, claimed, and released shifts.</p>
      </section>

      <hr className="section-rule" />

      <section className="py-4">
        <SectionKicker>Assigned</SectionKicker>
        {assigned.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-muted">
            No upcoming assigned shifts.{" "}
            <Link href="/marketplace" className="text-[var(--color-accent-700)]">
              Find work →
            </Link>
          </p>
        ) : (
          assigned.map((s) => (
            <div
              key={s.id}
              className="border-b-2 border-[var(--color-divider)] px-5 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className="text-[17px] leading-tight text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
                  >
                    {s.role}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {s.employerName} · {fmtDate(s.date)} · {fmtHour(s.startHour)}–
                    {fmtHour(s.endHour)}
                  </p>
                </div>
                <div
                  className="text-right text-[17px] tabular-nums text-[var(--color-text)]"
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
                >
                  {fmtMoney(s.estimatedNetCad)}
                  <div className="text-[10px] font-normal text-muted">est. net</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReleasing(s)}
                className="btn btn-secondary btn-block"
              >
                Release to marketplace
              </button>
            </div>
          ))
        )}
      </section>

      <hr className="section-rule" />

      <section className="py-4">
        <SectionKicker>Claimed</SectionKicker>
        {claimed.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-muted">
            Nothing claimed yet.{" "}
            <Link href="/marketplace" className="text-[var(--color-accent-700)]">
              Find work →
            </Link>
          </p>
        ) : (
          claimed.map((o) => (
            <div
              key={o.id}
              className="border-b-2 border-[var(--color-divider)] px-5 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/marketplace/${o.id}`}
                    className="text-[17px] leading-tight text-[var(--color-text)] hover:text-[var(--color-accent-700)]"
                    style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
                  >
                    {o.role}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {o.employerName} · {fmtDate(opportunityDate(o, demoToday))}
                  </p>
                  <span className="tag tag-outline mt-2">Pending employer approval</span>
                </div>
                <div
                  className="text-right text-[17px] tabular-nums text-[var(--color-text)]"
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
                >
                  {o.type === "job" && o.weeklyNetCad != null
                    ? `${fmtMoney(o.weeklyNetCad)}/wk`
                    : fmtMoney(o.estimatedNetCad)}
                  <div className="text-[10px] font-normal text-muted">est. net</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => unclaim(o.id)}
                className="btn btn-secondary btn-block"
              >
                Cancel claim
              </button>
            </div>
          ))
        )}
      </section>

      <hr className="section-rule" />

      <section className="py-4">
        <SectionKicker>Released</SectionKicker>
        {released.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-muted">
            You haven&apos;t released any shifts.{" "}
            <Link href="/marketplace" className="text-[var(--color-accent-700)]">
              Find work →
            </Link>
          </p>
        ) : (
          released.map((s) => (
            <div
              key={s.id}
              className="border-b-2 border-[var(--color-divider)] px-5 py-4 opacity-80"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className="text-[17px] leading-tight text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
                  >
                    {s.role}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {s.employerName} · {fmtDate(s.date)} · {fmtHour(s.startHour)}–
                    {fmtHour(s.endHour)}
                  </p>
                </div>
                <span className="tag tag-neutral shrink-0">In marketplace</span>
              </div>
              <p className="mt-2 text-[11px] text-muted">Visible to coworkers under Swaps.</p>
            </div>
          ))
        )}
      </section>

      {releasing && releasingImpact ? (
        <ReleaseShiftDialog
          shift={releasing}
          impact={releasingImpact}
          onConfirm={() => {
            releaseShift(releasing.id);
            setReleasing(null);
          }}
          onCancel={() => setReleasing(null)}
        />
      ) : null}
    </div>
  );
}
