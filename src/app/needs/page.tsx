"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyWorker, ErrorPlan, LoadingPlan } from "@/components/dashboard/PageStatus";
import { DemoResetButton } from "@/components/shared/DemoResetButton";
import { WorkerSwitcher } from "@/components/shared/WorkerSwitcher";
import { useAppData } from "@/lib/data/useAppData";
import { buildCashPlan, fmtDate, fmtMoney } from "@/lib/engine/plan";
import { useDemoState } from "@/lib/storage/demoState";

const BUFFER_PRESETS = [1, 2, 3, 5];

export default function NeedsPage() {
  const { loading, error, worker, financials, demoToday, planOptions } = useAppData();
  const { state, setNeeds } = useDemoState();

  const workerId = worker?.workerId ?? null;
  const needs = workerId ? (state.needsByWorker[workerId] ?? {}) : {};
  const estimate = financials ? Math.round(financials.avgDailyEssentialSpendCad) : 0;
  const hasSpendOverride = needs.dailySpendCad != null;

  // Local text kept only while the user is editing for the current worker, so
  // typing isn't fought by the store round-trip. Falls back to the stored value.
  const [edit, setEdit] = useState<{ workerId: string; text: string } | null>(null);
  const spendText =
    edit && edit.workerId === workerId ? edit.text : String(needs.dailySpendCad ?? estimate);

  if (loading) return <LoadingPlan />;
  if (error) return <ErrorPlan message={error} />;
  if (!worker || !financials || !workerId) {
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

  const bufferDays = needs.bufferDays ?? 2;
  const excluded = needs.excludedObligationIds ?? [];
  const plan = buildCashPlan(financials, demoToday, planOptions);
  const lastDay = plan.projection[plan.projection.length - 1]?.date ?? demoToday;
  const hasGap = plan.cashGapCad > 0 && plan.gapDate != null;

  const onSpendChange = (text: string) => {
    setEdit({ workerId, text });
    const v = Number(text);
    if (text.trim() !== "" && Number.isFinite(v) && v >= 0) {
      setNeeds(workerId, { dailySpendCad: v });
    }
  };

  const toggleObligation = (obligationId: string, enabled: boolean) => {
    const next = enabled
      ? excluded.filter((id) => id !== obligationId)
      : [...excluded.filter((id) => id !== obligationId), obligationId];
    setNeeds(workerId, { excludedObligationIds: next });
  };

  return (
    <div className="space-y-5 pb-36">
      <div className="flex items-start justify-between gap-2">
        <WorkerSwitcher />
        <DemoResetButton />
      </div>

      <div>
        <h1 className="text-xl font-bold text-zinc-50">Set your needs</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Tell us what your week actually costs. Everything else — your plan and matched work —
          starts from here.
        </p>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Safety buffer</h2>
        <p className="mt-1 text-xs text-zinc-500">
          How many days of everyday spending should always stay in reserve?
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {BUFFER_PRESETS.map((d) => {
            const active = bufferDays === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setNeeds(workerId, { bufferDays: d })}
                aria-pressed={active}
                className={`rounded-lg border px-2 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {d} {d === 1 ? "day" : "days"}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Daily spending</h2>
        <p className="mt-1 text-xs text-zinc-500">
          {hasSpendOverride
            ? "You've set your own number."
            : "Estimated from your last 28 days."}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              $
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={spendText}
              onChange={(e) => onSpendChange(e.target.value)}
              aria-label="Daily spending in CAD"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-7 pr-3 text-sm font-semibold tabular-nums text-zinc-100 outline-none focus:border-emerald-500/60"
            />
          </div>
          <span className="text-xs text-zinc-500">/ day</span>
          {hasSpendOverride && (
            <button
              type="button"
              onClick={() => {
                setEdit(null);
                setNeeds(workerId, { dailySpendCad: undefined });
              }}
              className="rounded-lg border border-zinc-800 px-3 py-2.5 text-xs font-medium text-zinc-300 hover:border-zinc-700"
            >
              Use estimate ({fmtMoney(estimate)})
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Bills &amp; obligations</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Toggle off anything that&apos;s paused or not yours — it&apos;s removed from your plan.
        </p>
        {financials.obligations.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No obligations on file.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-800">
            {financials.obligations.map((o) => {
              const enabled = !excluded.includes(o.obligationId);
              return (
                <li key={o.obligationId} className="flex items-center justify-between gap-3 py-3">
                  <div className={enabled ? "" : "opacity-50"}>
                    <div className="text-sm font-medium text-zinc-100">{o.name}</div>
                    <div className="text-xs text-zinc-500">
                      {fmtMoney(o.amountCad)} · {o.frequency} · due day {o.dueDayOfMonth}
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`${o.name} ${enabled ? "included" : "excluded"}`}
                    onClick={() => toggleObligation(o.obligationId, !enabled)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      enabled ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        enabled ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-14 z-10 mx-auto max-w-md px-4 pb-2">
        <div
          className={`rounded-xl border p-4 shadow-lg backdrop-blur ${
            hasGap
              ? "border-amber-500/40 bg-amber-950/80"
              : "border-emerald-500/40 bg-emerald-950/80"
          }`}
        >
          {hasGap ? (
            <p className="text-sm text-amber-200">
              With these needs: short{" "}
              <span className="font-bold tabular-nums">{fmtMoney(plan.cashGapCad)}</span> on{" "}
              <span className="font-bold">{fmtDate(plan.gapDate!)}</span>
            </p>
          ) : (
            <p className="text-sm text-emerald-200">
              With these needs: covered through{" "}
              <span className="font-bold">{fmtDate(lastDay)}</span>
            </p>
          )}
          {hasGap ? (
            <Link
              href="/marketplace"
              className="mt-3 block rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-amber-950 hover:bg-amber-400"
            >
              Find work that closes it
            </Link>
          ) : (
            <Link
              href="/plan"
              className="mt-3 block rounded-lg border border-emerald-500/50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10"
            >
              View plan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
