"use client";

import type { CashPlan } from "@/types";
import { fmtMoney } from "@/lib/engine/plan";

function weekdayShort(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short" });
}

export function DailyShortfalls({ plan }: { plan: CashPlan }) {
  if (plan.projection.length === 0) return null;

  return (
    <section className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
      <div className="flex min-w-max items-center gap-3">
        {plan.projection.map((day) => {
          const ok = day.endingBalanceCad >= plan.bufferTargetCad;
          const shortfall = Math.max(
            0,
            Math.round((plan.bufferTargetCad - day.endingBalanceCad) * 100) / 100
          );
          return (
            <div key={day.date} className="flex flex-col items-center gap-1 px-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                {weekdayShort(day.date)}
              </span>
              {ok ? (
                <span
                  className="h-2 w-2 rounded-full bg-emerald-400"
                  title="Above buffer"
                  aria-label={`${weekdayShort(day.date)}: on track`}
                />
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className="h-2 w-2 rounded-full bg-amber-400"
                    title={`Short ${fmtMoney(shortfall)}`}
                    aria-label={`${weekdayShort(day.date)}: short ${fmtMoney(shortfall)}`}
                  />
                  <span className="text-[10px] font-semibold tabular-nums text-amber-300/90">
                    {fmtMoney(shortfall)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
