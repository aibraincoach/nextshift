"use client";

import { useMemo, useState } from "react";
import type { WorkerFinancials } from "@/types";
import {
  addDays,
  buildCashPlan,
  fmtDate,
  fmtMoney,
  type PlanOptions,
} from "@/lib/engine/plan";
import { useDemoState } from "@/lib/storage/demoState";

function roundUpTo10(n: number): number {
  return Math.ceil(n / 10) * 10;
}

function stripGoalFromNeeds(needs: PlanOptions["needs"]): PlanOptions["needs"] {
  if (!needs) return needs;
  const rest = { ...needs };
  delete rest.goalAmountCad;
  delete rest.goalByDate;
  return rest;
}

export function computeGoalPrefill(
  financials: WorkerFinancials,
  demoToday: string,
  planOptions: PlanOptions
): { amountCad: number; byDate: string } {
  const baseline = buildCashPlan(financials, demoToday, {
    ...planOptions,
    needs: stripGoalFromNeeds(planOptions.needs),
  });
  const maxDate = addDays(demoToday, 30);
  const nextObl = baseline.upcomingObligations[0];

  let amountCad = 0;
  if (baseline.cashGapCad > 0) {
    amountCad = roundUpTo10(baseline.cashGapCad);
  } else if (nextObl) {
    amountCad = nextObl.amountCad;
  }

  let byDate = baseline.gapDate ?? nextObl?.date ?? addDays(demoToday, 7);
  if (byDate > maxDate) byDate = maxDate;
  if (byDate < demoToday) byDate = demoToday;

  return { amountCad, byDate };
}

export function GoalFormFields({
  workerId,
  demoToday,
  initialAmount,
  initialDate,
  onDone,
}: {
  workerId: string;
  demoToday: string;
  initialAmount: number;
  initialDate: string;
  onDone?: () => void;
}) {
  const { setNeeds } = useDemoState();
  const maxDate = addDays(demoToday, 30);
  const [amountText, setAmountText] = useState(String(initialAmount || ""));
  const [date, setDate] = useState(initialDate);

  const onSubmit = () => {
    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount <= 0 || !date) return;
    if (date < demoToday || date > maxDate) return;
    setNeeds(workerId, { goalAmountCad: Math.round(amount), goalByDate: date });
    onDone?.();
  };

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-[var(--color-text)]">
        I need{" "}
        <span className="inline-flex items-center align-middle">
          <span className="text-[var(--color-neutral-500)]">$</span>
          <input
            type="number"
            inputMode="decimal"
            min={1}
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            aria-label="Goal amount in CAD"
            className="input mx-1 inline-block w-[88px] tabular-nums"
            style={{ fontWeight: 800 }}
          />
        </span>{" "}
        by{" "}
        <input
          type="date"
          min={demoToday}
          max={maxDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Goal date"
          className="input inline-block w-auto"
          style={{ fontWeight: 600 }}
        />
      </p>
      <button type="button" onClick={onSubmit} className="btn btn-primary">
        Set goal
      </button>
    </div>
  );
}

export function GoalSetter({
  workerId,
  financials,
  demoToday,
  planOptions,
}: {
  workerId: string;
  financials: WorkerFinancials;
  demoToday: string;
  planOptions: PlanOptions;
}) {
  const { state, setNeeds } = useDemoState();
  const needs = state.needsByWorker[workerId] ?? {};
  const hasGoal = needs.goalAmountCad != null && needs.goalAmountCad > 0 && !!needs.goalByDate;
  const [editing, setEditing] = useState(false);

  const prefill = useMemo(
    () => computeGoalPrefill(financials, demoToday, planOptions),
    [financials, demoToday, planOptions]
  );

  if (hasGoal && !editing) {
    return (
      <section className="px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-text)]">
            Goal:{" "}
            <span className="tabular-nums" style={{ fontWeight: 800 }}>
              {fmtMoney(needs.goalAmountCad!)}
            </span>{" "}
            by{" "}
            <span style={{ fontWeight: 800 }}>{fmtDate(needs.goalByDate!)}</span>
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className="btn btn-secondary">
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setNeeds(workerId, { goalAmountCad: undefined, goalByDate: undefined });
                setEditing(false);
              }}
              className="btn btn-ghost"
            >
              Clear
            </button>
          </div>
        </div>
      </section>
    );
  }

  const formAmount = hasGoal ? needs.goalAmountCad! : prefill.amountCad;
  const formDate = hasGoal ? needs.goalByDate! : prefill.byDate;

  return (
    <section className="px-5 py-5">
      <h2
        className="text-base text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
      >
        What do you need?
      </h2>
      <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
        Start with your target — we&apos;ll show what to earn and which shifts close the gap.
      </p>
      <GoalFormFields
        key={`${workerId}-${formAmount}-${formDate}-${editing}`}
        workerId={workerId}
        demoToday={demoToday}
        initialAmount={formAmount}
        initialDate={formDate}
        onDone={() => setEditing(false)}
      />
    </section>
  );
}
