"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Store } from "lucide-react";
import { useAppData } from "@/lib/data/useAppData";
import { useDemoState } from "@/lib/storage/demoState";
import { fmtDate, fmtMoney, opportunityDate, releaseImpact } from "@/lib/engine/plan";
import { ReleaseShiftDialog } from "@/components/marketplace/ReleaseShiftDialog";
import { WorkerSwitcher } from "@/components/shared/WorkerSwitcher";
import type { AssignedShift } from "@/types";

function fmtHour(h: number): string {
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${h < 12 ? " AM" : " PM"}`;
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
    return <p className="py-16 text-center text-sm text-zinc-500">Loading your shifts…</p>;
  }
  if (error) {
    return <p className="py-16 text-center text-sm text-rose-400">Something went wrong: {error}</p>;
  }
  if (!financials) {
    return <p className="py-16 text-center text-sm text-zinc-500">No worker selected.</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-zinc-100">My shifts</h1>
        <p className="text-xs text-zinc-500">Assigned, claimed, and released shifts.</p>
      </div>

      <WorkerSwitcher />

      {/* Assigned */}
      <section className="space-y-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-200">
          <CalendarDays className="h-4 w-4 text-zinc-500" /> Assigned shifts
        </h2>
        {assigned.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500">
            No upcoming assigned shifts.
          </p>
        ) : (
          assigned.map((s) => (
            <div key={s.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{s.role}</div>
                  <div className="text-xs text-zinc-400">{s.employerName}</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {fmtDate(s.date)} · {fmtHour(s.startHour)}–{fmtHour(s.endHour)}
                  </div>
                </div>
                <div className="text-right text-sm font-bold tabular-nums text-zinc-100">
                  {fmtMoney(s.estimatedNetCad)}
                  <div className="text-[10px] font-normal text-zinc-500">est. net</div>
                </div>
              </div>
              <button
                onClick={() => setReleasing(s)}
                className="mt-3 w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-amber-600 hover:text-amber-300"
              >
                Release to marketplace
              </button>
            </div>
          ))
        )}
      </section>

      {/* Claimed */}
      <section className="space-y-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-200">
          <CalendarDays className="h-4 w-4 text-emerald-500" /> Claimed opportunities
        </h2>
        {claimed.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500">
            Nothing claimed yet.{" "}
            <Link href="/marketplace" className="text-emerald-400 hover:underline">
              Find work
            </Link>
          </p>
        ) : (
          claimed.map((o) => (
            <div key={o.id} className="rounded-xl border border-emerald-900/60 bg-zinc-900/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/marketplace/${o.id}`}
                    className="text-sm font-semibold text-zinc-100 hover:underline"
                  >
                    {o.role}
                  </Link>
                  <div className="text-xs text-zinc-400">{o.employerName}</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {fmtDate(opportunityDate(o, demoToday))}
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-emerald-400">
                    Pending employer approval
                  </div>
                </div>
                <div className="text-right text-sm font-bold tabular-nums text-zinc-100">
                  {o.type === "job" && o.weeklyNetCad != null
                    ? `${fmtMoney(o.weeklyNetCad)}/wk`
                    : fmtMoney(o.estimatedNetCad)}
                  <div className="text-[10px] font-normal text-zinc-500">est. net</div>
                </div>
              </div>
              <button
                onClick={() => unclaim(o.id)}
                className="mt-3 w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              >
                Cancel claim
              </button>
            </div>
          ))
        )}
      </section>

      {/* Released */}
      <section className="space-y-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-200">
          <Store className="h-4 w-4 text-zinc-500" /> Released shifts
        </h2>
        {released.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500">
            You haven&apos;t released any shifts.
          </p>
        ) : (
          released.map((s) => (
            <div key={s.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 opacity-90">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-300">{s.role}</div>
                  <div className="text-xs text-zinc-500">{s.employerName}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {fmtDate(s.date)} · {fmtHour(s.startHour)}–{fmtHour(s.endHour)}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                  In marketplace
                </span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                Visible to coworkers under Shift swaps.
              </p>
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
