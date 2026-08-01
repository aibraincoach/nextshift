"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CashPlan } from "@/types";
import { fmtDate, fmtMoney } from "@/lib/engine/plan";

function weekdayLong(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-CA", { weekday: "long" });
}

export function CashGapHero({ plan }: { plan: CashPlan }) {
  const goal = plan.goal;
  const hasGap = plan.cashGapCad > 0 && plan.gapDate;
  const lastProjectionDate = plan.projection[plan.projection.length - 1]?.date;
  const nextObl = plan.upcomingObligations[0];
  const coverLabel = nextObl?.name ?? "next bill";

  const showFindWork =
    (goal && !goal.onTrack) || (!goal && hasGap);

  let kicker: string;
  let headline: ReactNode;
  let body: string;

  if (goal) {
    if (goal.onTrack) {
      kicker = "On track";
      headline = (
        <>
          You&apos;re on track for{" "}
          <span className="tabular-nums">{fmtMoney(goal.amountCad)}</span>
        </>
      );
      body = `Projected ${fmtMoney(goal.projectedBalanceCad)} by ${fmtDate(goal.byDate)} — your goal looks reachable on current earnings.`;
    } else {
      kicker = `Goal shortfall · ${fmtDate(goal.byDate)}`;
      headline = (
        <span className="tabular-nums text-[var(--color-accent)]">
          {fmtMoney(goal.shortfallCad)}
        </span>
      );
      body = `Earn ${fmtMoney(goal.shortfallCad)} by ${weekdayLong(goal.byDate)} to reach your ${fmtMoney(goal.amountCad)} goal. Projected ${fmtMoney(goal.projectedBalanceCad)} by then.`;
    }
  } else if (hasGap) {
    kicker = `Cash shortfall · ${fmtDate(plan.gapDate!)}`;
    headline = (
      <span className="tabular-nums text-[var(--color-accent)]">
        {fmtMoney(plan.cashGapCad)}
      </span>
    );
    body = `Earn ${fmtMoney(plan.cashGapCad)} by ${weekdayLong(plan.gapDate!)} to cover your ${coverLabel} bill and keep your buffer.`;
  } else {
    kicker = "On track";
    headline = (
      <>
        Your budget holds through{" "}
        {lastProjectionDate ? fmtDate(lastProjectionDate) : "the next 7 days"}
      </>
    );
    body = "Your projected balance stays above your buffer target.";
  }

  const headlineIsAmount = !!(goal && !goal.onTrack) || (!goal && hasGap);

  return (
    <section className="px-5 py-6">
      <p
        className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-accent-700)]"
        style={{ fontWeight: 800 }}
      >
        {kicker}
      </p>

      <h1
        className={`mt-2 leading-none tracking-tight text-[var(--color-text)] ${
          headlineIsAmount ? "text-[72px] tabular-nums" : "text-[28px]"
        }`}
        style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
      >
        {headline}
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-[var(--color-neutral-700)]">{body}</p>

      {showFindWork ? (
        <Link href="/marketplace" className="btn btn-primary btn-block no-underline">
          Find work that closes it
          <ArrowRight size={16} strokeWidth={2.2} />
        </Link>
      ) : null}

      <Link href="/plan" className="btn btn-secondary btn-block no-underline">
        View full plan
      </Link>
    </section>
  );
}
