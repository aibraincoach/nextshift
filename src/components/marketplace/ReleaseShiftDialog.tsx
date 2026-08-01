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
  const shortfall = Math.abs(Math.round((impact.gapAfterCad - impact.gapBeforeCad) * 100) / 100);
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog !rounded-none">
        <h2 className="dialog-title">Release this shift?</h2>
        <p className="dialog-body">
          {shift.role} at {shift.employerName} · {fmtDate(shift.date)} ·{" "}
          <span className="tabular-nums">{fmtMoney(shift.estimatedNetCad)}</span> net
        </p>

        {impact.createsGap ? (
          <div className="flex gap-2.5 border-2 border-[var(--color-divider)] bg-[var(--color-accent-100)] p-3 text-sm text-[var(--color-accent-700)]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Releasing this shift reduces expected earnings by{" "}
              <span className="tabular-nums font-semibold">{fmtMoney(shift.estimatedNetCad)}</span>{" "}
              and creates a{" "}
              <span className="tabular-nums font-semibold">{fmtMoney(shortfall)}</span> shortfall
              {impact.gapDate ? <> on {fmtDate(impact.gapDate)}</> : null}.
            </p>
          </div>
        ) : (
          <div className="flex gap-2.5 border-2 border-[var(--color-divider)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
            <p>You stay covered — releasing this shift doesn&apos;t create a cash gap.</p>
          </div>
        )}

        <div className="dialog-actions !justify-stretch">
          <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
            Keep shift
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-primary flex-1">
            {impact.createsGap ? "Release anyway" : "Release shift"}
          </button>
        </div>
      </div>
    </div>
  );
}
