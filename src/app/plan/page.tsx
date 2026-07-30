"use client";

import Link from "next/link";
import { EmptyWorker, ErrorPlan, LoadingPlan } from "@/components/dashboard/PageStatus";
import { DemoResetButton } from "@/components/shared/DemoResetButton";
import { WorkerSwitcher } from "@/components/shared/WorkerSwitcher";
import { useAppData } from "@/lib/data/useAppData";
import { buildCashPlan, fmtDate, fmtMoney } from "@/lib/engine/plan";

export default function PlanPage() {
  const { loading, error, worker, financials, demoToday, planOptions } = useAppData();

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

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <WorkerSwitcher />
        <DemoResetButton />
      </div>

      <div>
        <h1 className="text-xl font-bold text-zinc-50">Your 7-day plan</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Projected cash day by day from {fmtDate(demoToday)}.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2.5 font-medium">Day</th>
                <th className="px-3 py-2.5 font-medium text-right">Earn</th>
                <th className="px-3 py-2.5 font-medium">Bills</th>
                <th className="px-3 py-2.5 font-medium text-right">Spend</th>
                <th className="px-3 py-2.5 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {plan.projection.map((day) => {
                const below = day.endingBalanceCad < plan.bufferTargetCad;
                return (
                  <tr
                    key={day.date}
                    className={`border-b border-zinc-800/80 last:border-0 ${
                      below ? "bg-rose-500/10" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 text-zinc-200">{fmtDate(day.date)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-emerald-300/90">
                      {fmtMoney(day.earningsCad)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-zinc-400">
                      {day.obligationNames.length > 0 ? (
                        <span>
                          {day.obligationNames.join(", ")}{" "}
                          <span className="tabular-nums text-zinc-300">
                            ({fmtMoney(day.obligationsCad)})
                          </span>
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-zinc-400">
                      {fmtMoney(day.essentialSpendCad)}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right font-semibold tabular-nums ${
                        below ? "text-rose-300" : "text-zinc-100"
                      }`}
                    >
                      {fmtMoney(day.endingBalanceCad)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Buffer target</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          We keep a cushion of{" "}
          <span className="font-semibold tabular-nums text-zinc-100">
            {fmtMoney(plan.bufferTargetCad)}
          </span>{" "}
          — about two days of everyday spending plus a small pad — so one quiet day doesn&apos;t
          tip you into a shortfall. Rows highlighted in rose end below that target.
        </p>
        {plan.cashGapCad > 0 && plan.gapDate ? (
          <p className="mt-3 text-sm text-amber-300">
            You still need {fmtMoney(plan.cashGapCad)} by {fmtDate(plan.gapDate)}.{" "}
            <Link href="/marketplace" className="underline hover:text-amber-200">
              Find a shift
            </Link>
          </p>
        ) : (
          <p className="mt-3 text-sm text-emerald-400">All seven days stay above your buffer.</p>
        )}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Next 30 days</h2>
        {plan.upcomingObligations.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No obligations scheduled.</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-800">
            {plan.upcomingObligations.map((o, i) => (
              <li
                key={`${o.name}-${o.date}-${i}`}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <div className="text-sm font-medium text-zinc-100">{o.name}</div>
                  <div className="text-xs text-zinc-500">
                    {fmtDate(o.date)}
                    {o.essential ? " · essential" : ""}
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums text-zinc-200">
                  {fmtMoney(o.amountCad)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-zinc-600">
        <Link href="/savings" className="text-zinc-400 underline hover:text-zinc-200">
          Adjust savings rate
        </Link>
      </p>
    </div>
  );
}
