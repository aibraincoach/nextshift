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
    <section className="border-t-2 border-[var(--color-divider)] px-5 py-5">
      <h2
        className="text-base text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
      >
        Upcoming obligations
      </h2>

      {next.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-neutral-600)]">
          No obligations in the next 30 days.
        </p>
      ) : (
        <ul className="mt-3">
          {next.map((o, i) => (
            <li
              key={`${o.name}-${o.date}-${i}`}
              className="flex items-center justify-between border-t border-[var(--color-divider)] py-3 first:border-t-0"
            >
              <div>
                <div className="text-sm text-[var(--color-text)]" style={{ fontWeight: 600 }}>
                  {o.name}
                </div>
                <div className="text-xs text-[var(--color-neutral-600)]">{fmtDate(o.date)}</div>
              </div>
              <div
                className="text-sm tabular-nums text-[var(--color-text)]"
                style={{ fontWeight: 800 }}
              >
                {fmtMoney(o.amountCad)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
