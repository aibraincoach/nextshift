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
    <div className="space-y-3">
      <p className="text-sm text-zinc-300">
        I need{" "}
        <span className="inline-flex items-center align-middle">
          <span className="text-zinc-500">$</span>
          <input
            type="number"
            inputMode="decimal"
            min={1}
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            aria-label="Goal amount in CAD"
            className="mx-0.5 w-20 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm font-semibold tabular-nums text-zinc-100 outline-none focus:border-emerald-500/60"
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
          className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm font-semibold text-zinc-100 outline-none focus:border-emerald-500/60"
        />
      </p>
      <button
        type="button"
        onClick={onSubmit}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
      >
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
      <section className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <p className="text-sm text-zinc-200">
          Goal:{" "}
          <span className="font-semibold tabular-nums text-zinc-50">
            {fmtMoney(needs.goalAmountCad!)}
          </span>{" "}
          by{" "}
          <span className="font-semibold text-zinc-50">{fmtDate(needs.goalByDate!)}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setNeeds(workerId, { goalAmountCad: undefined, goalByDate: undefined });
              setEditing(false);
            }}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          >
            Clear
          </button>
        </div>
      </section>
    );
  }

  const formAmount = hasGoal ? needs.goalAmountCad! : prefill.amountCad;
  const formDate = hasGoal ? needs.goalByDate! : prefill.byDate;

  return (
    <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <h2 className="text-sm font-semibold text-emerald-300">What do you need?</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Start with your target — we&apos;ll show what to earn and which shifts close the gap.
      </p>
      <div className="mt-3">
        <GoalFormFields
          key={`${workerId}-${formAmount}-${formDate}-${editing}`}
          workerId={workerId}
          demoToday={demoToday}
          initialAmount={formAmount}
          initialDate={formDate}
          onDone={() => setEditing(false)}
        />
      </div>
    </section>
  );
}
