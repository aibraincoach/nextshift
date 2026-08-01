"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyWorker, ErrorPlan, LoadingPlan } from "@/components/dashboard/PageStatus";
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
      <div className="px-5 py-5">
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
    <div className="pb-6">
      <header className="px-5 pt-5">
        <h1
          className="text-[28px] leading-tight tracking-tight text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Pay yourself first
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-neutral-700)]">
          Set aside a slice of expected daily earnings only when your bills stay covered.
        </p>
      </header>

      <hr className="section-rule my-5" />

      <section className="px-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Savings rate
        </h2>
        <div className="seg mt-3">
          {PRESETS.map(({ label, rate }) => (
            <label key={label} className="seg-opt">
              <input
                type="radio"
                name="savingsRate"
                checked={isPreset(rate)}
                onChange={() => selectPreset(rate)}
              />
              {label}
            </label>
          ))}
          <label className="seg-opt">
            <input
              type="radio"
              name="savingsRate"
              checked={customOpen}
              onChange={() => {
                setCustomMode(true);
                const current = Number(customPct);
                if (Number.isFinite(current) && current >= 0) {
                  update({ savingsRate: Math.min(50, current) / 100 });
                }
              }}
            />
            Custom
          </label>
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
              className="input w-24 tabular-nums"
              aria-label="Custom savings percent"
            />
            <span className="text-sm text-[var(--color-neutral-700)]">% of daily earnings</span>
          </div>
        ) : null}

        <p className="mt-3 text-xs text-[var(--color-neutral-600)]">
          Current rate:{" "}
          <span className="tabular-nums text-[var(--color-text)]">
            {Math.round(state.savingsRate * 1000) / 10}%
          </span>
        </p>
      </section>

      <hr className="section-rule my-5" />

      <section className="px-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Safe to save today
        </h2>
        <p
          className="mt-2 tabular-nums text-[56px] leading-none text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          {fmtMoney(plan.safeToSaveTodayCad)}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-neutral-700)]">
          {plan.safeToSaveTodayCad > 0 ? (
            <>
              Saving{" "}
              <span className="font-semibold tabular-nums text-[var(--color-text)]">
                {fmtMoney(plan.safeToSaveTodayCad)}
              </span>{" "}
              from today&apos;s pay keeps all bills covered.
            </>
          ) : (
            <>
              No spare cash today without dipping below your buffer.{" "}
              <Link href="/marketplace" className="text-[var(--color-accent)] hover:underline">
                Find a shift
              </Link>{" "}
              to create headroom.
            </>
          )}
        </p>
      </section>

      {gapIncreased ? (
        <>
          <hr className="section-rule my-5" />
          <section className="px-5">
            <h2
              className="text-base text-[var(--color-accent-700)]"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
            >
              Savings raises your gap
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-neutral-700)]">
              With savings on, your cash gap is{" "}
              <span className="font-semibold tabular-nums text-[var(--color-text)]">
                {fmtMoney(plan.cashGapCad)}
              </span>
              {planWithoutSavings.cashGapCad > 0
                ? ` (was ${fmtMoney(planWithoutSavings.cashGapCad)} with savings off)`
                : " — you had no gap with savings off"}
              . Consider a lower rate or an extra shift.
            </p>
          </section>
        </>
      ) : null}

      <hr className="section-rule my-5" />

      <section className="px-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Effect on runway
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-[var(--color-neutral-600)]">Lowest balance (7d)</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-[var(--color-text)]">
              {fmtMoney(plan.lowestBalanceCad)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-neutral-600)]">Cash gap</dt>
            <dd
              className={`mt-0.5 font-semibold tabular-nums ${
                plan.cashGapCad > 0
                  ? "text-[var(--color-accent-700)]"
                  : "text-[var(--color-text)]"
              }`}
              style={plan.cashGapCad > 0 ? { fontWeight: 800 } : undefined}
            >
              {fmtMoney(plan.cashGapCad)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-neutral-600)]">Buffer target</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-[var(--color-text)]">
              {fmtMoney(plan.bufferTargetCad)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-neutral-600)]">Without savings</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-[var(--color-neutral-700)]">
              gap {fmtMoney(planWithoutSavings.cashGapCad)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm">
          <Link href="/plan" className="text-[var(--color-accent)] hover:underline">
            See full 7-day plan
          </Link>
        </p>
      </section>
    </div>
  );
}
