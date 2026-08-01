"use client";

import Link from "next/link";
import { EmptyWorker, ErrorPlan, LoadingPlan } from "@/components/dashboard/PageStatus";
import { useAppData } from "@/lib/data/useAppData";
import { buildCashPlan, fmtDate, fmtMoney } from "@/lib/engine/plan";

export default function PlanPage() {
  const { loading, error, worker, financials, demoToday, planOptions } = useAppData();

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
  const dayCount = plan.projection.length;
  const lastDay = plan.projection[plan.projection.length - 1]?.date ?? demoToday;
  const hasGap = plan.cashGapCad > 0 && plan.gapDate != null;

  return (
    <div className="pb-6">
      <header className="px-5 pt-5">
        <h1
          className="text-[28px] leading-tight tracking-tight text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Your {dayCount}-day plan
        </h1>
        <p className="mt-2 text-sm text-[var(--color-neutral-700)]">
          Projected cash day by day from {fmtDate(demoToday)}
          {dayCount > 1 ? ` through ${fmtDate(lastDay)}` : ""}.
        </p>

        {plan.goal ? (
          <p className="mt-3 text-sm text-[var(--color-neutral-700)]">
            Goal:{" "}
            <span className="font-semibold tabular-nums text-[var(--color-text)]">
              {fmtMoney(plan.goal.amountCad)}
            </span>{" "}
            by{" "}
            <span className="font-semibold text-[var(--color-text)]">
              {fmtDate(plan.goal.byDate)}
            </span>
          </p>
        ) : null}

        {hasGap ? (
          <p
            className="mt-3 text-sm text-[var(--color-accent-700)]"
            style={{ fontWeight: 800 }}
          >
            {fmtMoney(plan.cashGapCad)} short on {fmtDate(plan.gapDate!)}
          </p>
        ) : (
          <p
            className="mt-3 text-sm text-[var(--color-accent-700)]"
            style={{ fontWeight: 800 }}
          >
            You&apos;re covered through {fmtDate(lastDay)}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {hasGap ? (
            <Link
              href="/marketplace"
              className="no-underline text-[var(--color-accent-700)] hover:underline"
              style={{ fontWeight: 800 }}
            >
              Close this gap →
            </Link>
          ) : null}
          <Link
            href="/needs"
            className="text-[var(--color-neutral-700)] no-underline hover:text-[var(--color-text)] hover:underline"
          >
            Edit needs
          </Link>
          {!plan.goal ? (
            <Link
              href="/needs"
              className="text-[var(--color-neutral-700)] no-underline hover:text-[var(--color-text)] hover:underline"
            >
              Set a goal
            </Link>
          ) : null}
        </div>
      </header>

      <hr className="section-rule my-5" />

      <section className="overflow-x-auto px-5">
        <table className="table min-w-[360px]">
          <thead>
            <tr>
              <th>Day</th>
              <th className="text-right">Earn</th>
              <th>Bills</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {plan.projection.map((day) => {
              const below = day.endingBalanceCad < plan.bufferTargetCad;
              const isGoalDay = plan.goal?.byDate === day.date;
              const shortAmt = plan.bufferTargetCad - day.endingBalanceCad;
              return (
                <tr key={day.date} className={isGoalDay ? "bg-[var(--color-accent-100)]" : undefined}>
                  <td>
                    <span className="text-[var(--color-text)]">{fmtDate(day.date)}</span>
                    {isGoalDay ? (
                      <span className="tag tag-accent ml-2">goal day</span>
                    ) : null}
                    {below ? (
                      <span className="tag tag-accent ml-2 tabular-nums">
                        short {fmtMoney(shortAmt)}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-right tabular-nums text-[var(--color-text)]">
                    {fmtMoney(day.earningsCad)}
                  </td>
                  <td className="text-xs text-[var(--color-neutral-700)]">
                    {day.obligationNames.length > 0 ? (
                      <span>
                        {day.obligationNames.join(", ")}{" "}
                        <span className="tabular-nums text-[var(--color-text)]">
                          ({fmtMoney(day.obligationsCad)})
                        </span>
                      </span>
                    ) : (
                      <span className="text-[var(--color-neutral-500)]">—</span>
                    )}
                  </td>
                  <td
                    className={`text-right font-semibold tabular-nums ${
                      below ? "text-[var(--color-accent-700)]" : "text-[var(--color-text)]"
                    }`}
                    style={below ? { fontWeight: 800 } : undefined}
                  >
                    {fmtMoney(day.endingBalanceCad)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <hr className="section-rule my-5" />

      <section className="px-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Buffer target
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-neutral-700)]">
          We keep a cushion of{" "}
          <span className="font-semibold tabular-nums text-[var(--color-text)]">
            {fmtMoney(plan.bufferTargetCad)}
          </span>{" "}
          — exactly your chosen days of everyday spending — so one quiet day doesn&apos;t tip you
          into a shortfall. Days below that target are highlighted. Change your buffer and daily
          spending on the{" "}
          <Link href="/needs" className="text-[var(--color-accent-700)] hover:underline">
            needs page
          </Link>
          .
        </p>
        {hasGap ? (
          <p className="mt-3 text-sm text-[var(--color-neutral-700)]">
            You still need {fmtMoney(plan.cashGapCad)} by {fmtDate(plan.gapDate!)}.{" "}
            <Link href="/marketplace" className="text-[var(--color-accent-700)] hover:underline">
              Find a shift
            </Link>
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-neutral-700)]">
            All projected days stay above your buffer.
          </p>
        )}
      </section>

      <hr className="section-rule my-5" />

      <section className="px-5">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Next 30 days
        </h2>
        {plan.upcomingObligations.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-neutral-600)]">No obligations scheduled.</p>
        ) : (
          <ul className="mt-3">
            {plan.upcomingObligations.map((o, i) => (
              <li
                key={`${o.name}-${o.date}-${i}`}
                className="flex items-center justify-between border-b border-[var(--color-divider)] py-3 last:border-0"
              >
                <div>
                  <div className="text-sm font-medium text-[var(--color-text)]">{o.name}</div>
                  <div className="text-xs text-[var(--color-neutral-600)]">
                    {fmtDate(o.date)}
                    {o.essential ? " · essential" : ""}
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums text-[var(--color-text)]">
                  {fmtMoney(o.amountCad)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 px-5 text-sm">
        <Link href="/savings" className="text-[var(--color-accent-700)] hover:underline">
          Adjust savings rate
        </Link>
      </p>
    </div>
  );
}
