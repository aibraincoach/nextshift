"use client";

import type { CashPlan } from "@/types";
import { fmtDate, fmtMoney } from "@/lib/engine/plan";

export function UpcomingObligations({
  upcoming,
}: {
  upcoming: CashPlan["upcomingObligations"];
}) {
  const next = upcoming.slice(0, 4);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="text-sm font-semibold text-zinc-200">Upcoming obligations</h2>
      {next.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No obligations in the next 30 days.</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-800">
          {next.map((o, i) => (
            <li key={`${o.name}-${o.date}-${i}`} className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-sm font-medium text-zinc-100">{o.name}</div>
                <div className="text-xs text-zinc-500">{fmtDate(o.date)}</div>
              </div>
              <div className="text-sm font-semibold tabular-nums text-zinc-200">
                {fmtMoney(o.amountCad)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
