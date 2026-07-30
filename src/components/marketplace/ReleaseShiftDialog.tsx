"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { AssignedShift } from "@/types";
import { fmtDate, fmtMoney } from "@/lib/engine/plan";

export interface ReleaseImpactSummary {
  gapBeforeCad: number;
  gapAfterCad: number;
  createsGap: boolean;
  gapDate: string | null;
}

export function ReleaseShiftDialog({
  shift,
  impact,
  onConfirm,
  onCancel,
}: {
  shift: AssignedShift;
  impact: ReleaseImpactSummary;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const shortfall = Math.round((impact.gapAfterCad - impact.gapBeforeCad) * 100) / 100;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-base font-semibold text-zinc-100">Release this shift?</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {shift.role} at {shift.employerName} · {fmtDate(shift.date)} ·{" "}
          <span className="tabular-nums">{fmtMoney(shift.estimatedNetCad)}</span> net
        </p>

        {impact.createsGap ? (
          <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-700/60 bg-amber-500/10 p-3 text-sm text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Releasing this shift reduces expected earnings by{" "}
              <span className="font-semibold tabular-nums">{fmtMoney(shift.estimatedNetCad)}</span>{" "}
              and creates a{" "}
              <span className="font-semibold tabular-nums">{fmtMoney(shortfall)}</span> shortfall
              {impact.gapDate ? <> on {fmtDate(impact.gapDate)}</> : null}.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex gap-2.5 rounded-xl border border-zinc-700 bg-zinc-800/60 p-3 text-sm text-zinc-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <p>You stay covered — releasing this shift doesn&apos;t create a cash gap.</p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500"
          >
            Keep shift
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              impact.createsGap
                ? "bg-amber-500 text-amber-950 hover:bg-amber-400"
                : "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
            }`}
          >
            {impact.createsGap ? "Release anyway" : "Release shift"}
          </button>
        </div>
      </div>
    </div>
  );
}
