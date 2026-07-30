"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyWorker, ErrorPlan, LoadingPlan } from "@/components/dashboard/PageStatus";
import { DemoResetButton } from "@/components/shared/DemoResetButton";
import { WorkerSwitcher } from "@/components/shared/WorkerSwitcher";
import { useAppData } from "@/lib/data/useAppData";
import { buildCashPlan, fmtMoney } from "@/lib/engine/plan";
import { useDemoState } from "@/lib/storage/demoState";

const PRESETS = [
  { label: "Off", rate: 0 },
  { label: "2%", rate: 0.02 },
  { label: "5%", rate: 0.05 },
] as const;

function rateMatches(a: number, b: number) {
  return Math.abs(a - b) < 0.0001;
}

export default function SavingsPage() {
  const { loading, error, worker, financials, demoToday, planOptions } = useAppData();
  const { state, update } = useDemoState();
  const matchesPreset = PRESETS.some((p) => rateMatches(p.rate, state.savingsRate));
  const [customMode, setCustomMode] = useState(false);
  const customOpen = customMode || !matchesPreset;
  const [customPct, setCustomPct] = useState(() =>
    String(Math.round(state.savingsRate * 1000) / 10)
  );

  if (loading) return <LoadingPlan />;
  if (error) return <ErrorPlan message={error} />;
  if (!worker || !financials) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <WorkerSwitcher />
          <DemoResetButton />
        </div>
        <EmptyWorker />
      </div>
    );
  }

  const plan = buildCashPlan(financials, demoToday, planOptions);
  const planWithoutSavings = buildCashPlan(financials, demoToday, {
    ...planOptions,
    savingsRate: 0,
  });
  const gapIncreased =
    state.savingsRate > 0 && plan.cashGapCad > planWithoutSavings.cashGapCad;

  const isPreset = (rate: number) => rateMatches(state.savingsRate, rate) && !customOpen;

  const selectPreset = (rate: number) => {
    setCustomMode(false);
    setCustomPct(String(Math.round(rate * 1000) / 10));
    update({ savingsRate: rate });
  };

  const applyCustom = (raw: string) => {
    setCustomPct(raw);
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return;
    const clamped = Math.min(50, n);
    update({ savingsRate: clamped / 100 });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <WorkerSwitcher />
        <DemoResetButton />
      </div>

      <div>
        <h1 className="text-xl font-bold text-zinc-50">Pay yourself first</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Set aside a slice of expected daily earnings only when your bills stay covered.
        </p>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Savings rate</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map(({ label, rate }) => (
            <button
              key={label}
              type="button"
              onClick={() => selectPreset(rate)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isPreset(rate)
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setCustomMode(true);
              const current = Number(customPct);
              if (Number.isFinite(current) && current >= 0) {
                update({ savingsRate: Math.min(50, current) / 100 });
              }
            }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              customOpen
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            Custom
          </button>
        </div>

        {customOpen ? (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={customPct}
              onChange={(e) => applyCustom(e.target.value)}
              className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm tabular-nums text-zinc-100 outline-none focus:border-emerald-500"
              aria-label="Custom savings percent"
            />
            <span className="text-sm text-zinc-400">% of daily earnings</span>
          </div>
        ) : null}

        <p className="mt-3 text-xs text-zinc-500">
          Current rate:{" "}
          <span className="tabular-nums text-zinc-300">
            {Math.round(state.savingsRate * 1000) / 10}%
          </span>
        </p>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Safe to save today</h2>
        <p className="mt-2 text-3xl font-bold tabular-nums text-emerald-300">
          {fmtMoney(plan.safeToSaveTodayCad)}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {plan.safeToSaveTodayCad > 0 ? (
            <>
              Saving{" "}
              <span className="font-semibold tabular-nums text-zinc-100">
                {fmtMoney(plan.safeToSaveTodayCad)}
              </span>{" "}
              from today&apos;s pay keeps all bills covered.
            </>
          ) : (
            <>
              No spare cash today without dipping below your buffer.{" "}
              <Link href="/marketplace" className="text-emerald-400 underline hover:text-emerald-300">
                Find a shift
              </Link>{" "}
              to create headroom.
            </>
          )}
        </p>
      </section>

      {gapIncreased ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <h2 className="text-sm font-semibold text-amber-300">Savings raises your gap</h2>
          <p className="mt-1 text-sm text-zinc-300">
            With savings on, your cash gap is{" "}
            <span className="font-semibold tabular-nums">{fmtMoney(plan.cashGapCad)}</span>
            {planWithoutSavings.cashGapCad > 0
              ? ` (was ${fmtMoney(planWithoutSavings.cashGapCad)} with savings off)`
              : " — you had no gap with savings off"}
            . Consider a lower rate or an extra shift.
          </p>
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Effect on runway</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-zinc-500">Lowest balance (7d)</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-zinc-100">
              {fmtMoney(plan.lowestBalanceCad)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Cash gap</dt>
            <dd
              className={`mt-0.5 font-semibold tabular-nums ${
                plan.cashGapCad > 0 ? "text-amber-300" : "text-emerald-300"
              }`}
            >
              {fmtMoney(plan.cashGapCad)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Buffer target</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-zinc-100">
              {fmtMoney(plan.bufferTargetCad)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Without savings</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-zinc-400">
              gap {fmtMoney(planWithoutSavings.cashGapCad)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-zinc-500">
          <Link href="/plan" className="underline hover:text-zinc-300">
            See full 7-day plan
          </Link>
        </p>
      </section>
    </div>
  );
}
