"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyWorker, ErrorPlan, LoadingPlan } from "@/components/dashboard/PageStatus";
import { GoalFormFields, computeGoalPrefill } from "@/components/dashboard/GoalSetter";
import { useAppData } from "@/lib/data/useAppData";
import { buildCashPlan, fmtDate, fmtMoney } from "@/lib/engine/plan";
import { useDemoState } from "@/lib/storage/demoState";

const BUFFER_PRESETS = [1, 2, 3, 5];

function SquareToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    >
      {/* Visual switch matches mock (22×40); hit target is 44×44 */}
      <span
        className="relative block h-[22px] w-10 transition-colors"
        style={{
          background: checked ? "var(--color-accent)" : "var(--color-neutral-300)",
        }}
        aria-hidden
      >
        <span
          className="absolute top-[3px] h-4 w-4 bg-[var(--color-bg)] transition-all"
          style={{ left: checked ? "21px" : "3px" }}
        />
      </span>
    </button>
  );
}

export default function NeedsPage() {
  const { loading, error, worker, financials, demoToday, planOptions } = useAppData();
  const { state, setNeeds } = useDemoState();

  const workerId = worker?.workerId ?? null;
  const needs = workerId ? (state.needsByWorker[workerId] ?? {}) : {};
  const estimate = financials ? Math.round(financials.avgDailyEssentialSpendCad) : 0;
  const incomeEstimate = financials ? Math.round(financials.expectedDailyNetCad) : 0;
  const hasSpendOverride = needs.dailySpendCad != null;
  const hasIncomeOverride = needs.expectedDailyNetCad != null;

  const [edit, setEdit] = useState<{ workerId: string; text: string } | null>(null);
  const [incomeEdit, setIncomeEdit] = useState<{ workerId: string; text: string } | null>(null);
  const spendText =
    edit && edit.workerId === workerId ? edit.text : String(needs.dailySpendCad ?? estimate);
  const incomeText =
    incomeEdit && incomeEdit.workerId === workerId
      ? incomeEdit.text
      : String(needs.expectedDailyNetCad ?? incomeEstimate);

  if (loading) return <LoadingPlan />;
  if (error) return <ErrorPlan message={error} />;
  if (!worker || !financials || !workerId) {
    return (
      <div className="px-5 py-5">
        <EmptyWorker />
      </div>
    );
  }

  const bufferDays = needs.bufferDays ?? 2;
  const excluded = needs.excludedObligationIds ?? [];
  const plan = buildCashPlan(financials, demoToday, planOptions);
  const goalPrefill = computeGoalPrefill(financials, demoToday, planOptions);
  const hasGoal = needs.goalAmountCad != null && needs.goalAmountCad > 0 && !!needs.goalByDate;
  const lastDay = plan.projection[plan.projection.length - 1]?.date ?? demoToday;
  const hasGap = plan.cashGapCad > 0 && plan.gapDate != null;

  const onSpendChange = (text: string) => {
    setEdit({ workerId, text });
    const v = Number(text);
    if (text.trim() !== "" && Number.isFinite(v) && v >= 0) {
      setNeeds(workerId, { dailySpendCad: v });
    }
  };

  const onIncomeChange = (text: string) => {
    setIncomeEdit({ workerId, text });
    const v = Number(text);
    if (text.trim() !== "" && Number.isFinite(v) && v >= 0) {
      setNeeds(workerId, { expectedDailyNetCad: v });
    }
  };

  const toggleObligation = (obligationId: string, enabled: boolean) => {
    const next = enabled
      ? excluded.filter((id) => id !== obligationId)
      : [...excluded.filter((id) => id !== obligationId), obligationId];
    setNeeds(workerId, { excludedObligationIds: next });
  };

  return (
    <div className="pb-44">
      <header className="px-5 pt-5">
        <h1
          className="text-[28px] leading-tight tracking-tight text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Set your needs
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-neutral-700)]">
          Tell us what your week actually costs. Everything else — your plan and matched work —
          starts from here.
        </p>
      </header>

      <hr className="section-rule my-5" />

      <section className="px-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Your goal
        </h2>
        <p className="mt-1 text-xs text-[var(--color-neutral-600)]">
          What do you need by when? Prefilled from your history — edit if it&apos;s wrong.
        </p>
        <div className="mt-3">
          <GoalFormFields
            key={`${workerId}-${hasGoal ? needs.goalAmountCad : goalPrefill.amountCad}-${hasGoal ? needs.goalByDate : goalPrefill.byDate}`}
            workerId={workerId}
            demoToday={demoToday}
            initialAmount={hasGoal ? needs.goalAmountCad! : goalPrefill.amountCad}
            initialDate={hasGoal ? needs.goalByDate! : goalPrefill.byDate}
          />
        </div>
        {hasGoal ? (
          <button
            type="button"
            onClick={() => setNeeds(workerId, { goalAmountCad: undefined, goalByDate: undefined })}
            className="btn btn-secondary mt-3"
          >
            Clear goal
          </button>
        ) : null}
      </section>

      <hr className="section-rule my-5" />

      <section className="px-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Expected daily income
        </h2>
        <p className="mt-1 text-xs text-[var(--color-neutral-600)]">
          {hasIncomeOverride
            ? "You've set your own number."
            : "Estimated from your history — edit if it's wrong."}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-[var(--color-neutral-600)]">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={incomeText}
              onChange={(e) => onIncomeChange(e.target.value)}
              aria-label="Expected daily income in CAD"
              className="input pl-7 font-semibold tabular-nums"
            />
          </div>
          <span className="text-xs text-[var(--color-neutral-600)]">/ day</span>
        </div>
        {hasIncomeOverride ? (
          <button
            type="button"
            onClick={() => {
              setIncomeEdit(null);
              setNeeds(workerId, { expectedDailyNetCad: undefined });
            }}
            className="btn btn-secondary mt-2"
          >
            Use estimate ({fmtMoney(incomeEstimate)})
          </button>
        ) : null}
      </section>

      <hr className="section-rule my-5" />

      <section className="px-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Safety buffer
        </h2>
        <p className="mt-1 text-xs text-[var(--color-neutral-600)]">
          How many days of everyday spending should always stay in reserve?
        </p>
        <div className="seg mt-3">
          {BUFFER_PRESETS.map((d) => (
            <label key={d} className="seg-opt">
              <input
                type="radio"
                name="bufferDays"
                checked={bufferDays === d}
                onChange={() => setNeeds(workerId, { bufferDays: d })}
              />
              {d} {d === 1 ? "day" : "days"}
            </label>
          ))}
        </div>
      </section>

      <hr className="section-rule my-5" />

      <section className="px-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Daily spending
        </h2>
        <p className="mt-1 text-xs text-[var(--color-neutral-600)]">
          {hasSpendOverride
            ? "You've set your own number."
            : "Estimated from your last 28 days."}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-[var(--color-neutral-600)]">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={spendText}
              onChange={(e) => onSpendChange(e.target.value)}
              aria-label="Daily spending in CAD"
              className="input pl-7 font-semibold tabular-nums"
            />
          </div>
          <span className="text-xs text-[var(--color-neutral-600)]">/ day</span>
        </div>
        {hasSpendOverride ? (
          <button
            type="button"
            onClick={() => {
              setEdit(null);
              setNeeds(workerId, { dailySpendCad: undefined });
            }}
            className="btn btn-secondary mt-2"
          >
            Use estimate ({fmtMoney(estimate)})
          </button>
        ) : null}
      </section>

      <hr className="section-rule my-5" />

      <section className="px-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Bills &amp; obligations
        </h2>
        <p className="mt-1 text-xs text-[var(--color-neutral-600)]">
          Toggle off anything that&apos;s paused or not yours — it&apos;s removed from your plan.
        </p>
        {financials.obligations.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-neutral-600)]">No obligations on file.</p>
        ) : (
          <ul className="mt-3">
            {financials.obligations.map((o) => {
              const enabled = !excluded.includes(o.obligationId);
              return (
                <li
                  key={o.obligationId}
                  className="flex items-center justify-between gap-3 border-b border-[var(--color-divider)] py-3 last:border-0"
                >
                  <div className={enabled ? "" : "opacity-50"}>
                    <div className="text-sm font-medium text-[var(--color-text)]">{o.name}</div>
                    <div className="text-xs text-[var(--color-neutral-600)]">
                      {fmtMoney(o.amountCad)} · {o.frequency} · due day {o.dueDayOfMonth}
                    </div>
                  </div>
                  <SquareToggle
                    checked={enabled}
                    onChange={(next) => toggleObligation(o.obligationId, next)}
                    label={`${o.name} ${enabled ? "included" : "excluded"}`}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-[84px] z-10 mx-auto max-w-md px-5">
        <div className="border border-[var(--color-divider)] bg-[var(--color-surface)] p-4">
          {hasGap ? (
            <p className="text-sm text-[var(--color-text)]">
              With these needs: short{" "}
              <span className="font-bold tabular-nums">{fmtMoney(plan.cashGapCad)}</span> on{" "}
              <span className="font-bold">{fmtDate(plan.gapDate!)}</span>
            </p>
          ) : (
            <p className="text-sm text-[var(--color-text)]">
              With these needs: covered through{" "}
              <span className="font-bold">{fmtDate(lastDay)}</span>
            </p>
          )}
          {hasGap ? (
            <Link href="/marketplace" className="btn btn-primary btn-block no-underline">
              Find work that closes it
            </Link>
          ) : (
            <Link href="/plan" className="btn btn-primary btn-block no-underline">
              View plan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
