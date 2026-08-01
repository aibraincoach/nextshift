"use client";

import type { CashPlan } from "@/types";
import { fmtMoney } from "@/lib/engine/plan";

function weekdayShort(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short" });
}

export function DailyShortfalls({ plan }: { plan: CashPlan }) {
  if (plan.projection.length === 0) return null;

  return (
    <section className="px-5 py-5">
      <h2
        className="text-base text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
      >
        Week at a glance
      </h2>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {plan.projection.map((day) => {
          const ok = day.endingBalanceCad >= plan.bufferTargetCad;
          const shortfall = Math.max(
            0,
            Math.round((plan.bufferTargetCad - day.endingBalanceCad) * 100) / 100
          );
          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--color-neutral-500)]">
                {weekdayShort(day.date)}
              </span>
              {ok ? (
                <span
                  className="text-[11px] text-[var(--color-neutral-500)]"
                  style={{ fontWeight: 600 }}
                  aria-label={`${weekdayShort(day.date)}: on track`}
                >
                  OK
                </span>
              ) : (
                <span
                  className="text-[11px] tabular-nums text-[var(--color-accent-700)]"
                  style={{ fontWeight: 800 }}
                  aria-label={`${weekdayShort(day.date)}: short ${fmtMoney(shortfall)}`}
                >
                  {fmtMoney(shortfall)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-neutral-500)]">
        Dollars short of your buffer, per day
      </p>
    </section>
  );
}
