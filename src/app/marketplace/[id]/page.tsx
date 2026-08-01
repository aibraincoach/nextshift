"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, MapPin, Clock, Zap } from "lucide-react";
import { useAppData } from "@/lib/data/useAppData";
import {
  buildCashPlan,
  fmtDate,
  fmtMoney,
  opportunityDate,
  opportunityImpact,
  opportunityPayoutDate,
} from "@/lib/engine/plan";
import { jobMonthlySurplus, scoreOpportunity } from "@/lib/engine/match";
import { compareAdvanceVsShift } from "@/lib/engine/ewa";
import { useDemoState } from "@/lib/storage/demoState";
import { MatchScoreBreakdown } from "@/components/marketplace/MatchScoreBreakdown";
import { ClaimButton } from "@/components/marketplace/ClaimButton";
import { hoursLabel } from "@/components/marketplace/OpportunityCard";
import type { Opportunity } from "@/types";

function typeKicker(opp: Opportunity): string {
  if (opp.type === "job") return "Job";
  if (opp.type === "released-shift") {
    return opp.payoutDaysAfter === 0
      ? "Shift swap · pays same day"
      : `Shift swap · pays in ${opp.payoutDaysAfter} days`;
  }
  return opp.payoutDaysAfter === 0
    ? "Shift · pays same day"
    : `Shift · pays in ${opp.payoutDaysAfter} days`;
}

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { loading, error, opportunities, worker, financials, demoToday, planOptions } =
    useAppData();

  const opp = useMemo(
    () => opportunities.find((o) => o.id === id) ?? null,
    [opportunities, id]
  );

  const { state } = useDemoState();
  const isClaimed = opp ? state.claimedOpportunityIds.includes(opp.id) : false;

  const computed = useMemo(() => {
    if (!opp || !worker || !financials) return null;
    let opts = planOptions;
    if (isClaimed && opp.type !== "job") {
      const payoutDate = opportunityPayoutDate(opp, demoToday);
      const extra = [...(planOptions.extraIncome ?? [])];
      const idx = extra.findIndex(
        (e) => e.date === payoutDate && e.netCad === opp.estimatedNetCad
      );
      if (idx >= 0) {
        extra.splice(idx, 1);
        opts = { ...planOptions, extraIncome: extra };
      }
    }
    const basePlan = buildCashPlan(financials, demoToday, opts);
    return {
      score: scoreOpportunity(worker, financials, demoToday, opp, opts),
      impact: opportunityImpact(financials, demoToday, opp, opts),
      basePlan,
      ewa:
        basePlan.cashGapCad > 0 && opp.type !== "job"
          ? compareAdvanceVsShift(financials, demoToday, opp, opts)
          : null,
    };
  }, [opp, worker, financials, demoToday, planOptions, isClaimed]);

  if (loading) {
    return <p className="px-5 py-16 text-center text-sm text-muted">Loading opportunity…</p>;
  }
  if (error) {
    return (
      <p className="px-5 py-16 text-center text-sm text-[var(--color-accent-700)]">
        Something went wrong: {error}
      </p>
    );
  }
  if (!opp || !worker || !financials || !computed) {
    return (
      <div className="space-y-4 px-5 py-16 text-center">
        <p className="text-sm text-muted">This opportunity no longer exists.</p>
        <Link href="/marketplace" className="btn btn-secondary">
          All work
        </Link>
      </div>
    );
  }

  const { score, impact, ewa, basePlan } = computed;
  const hours = hoursLabel(opp);
  const isJob = opp.type === "job";
  const surplus =
    isJob && opp.weeklyNetCad != null ? jobMonthlySurplus(financials, opp.weeklyNetCad) : null;
  const payoutDate = opportunityPayoutDate(opp, demoToday);
  const paysAfterGoal = basePlan.goal != null && payoutDate > basePlan.goal.byDate;

  return (
    <div className="pb-2">
      <div className="px-5 pt-4">
        <Link href="/marketplace" className="btn btn-ghost inline-flex items-center gap-1.5 !px-0">
          <ArrowLeft className="h-3.5 w-3.5" /> All work
        </Link>
      </div>

      <section className="px-5 py-5">
        <p
          className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-accent-700)]"
          style={{ fontWeight: 800 }}
        >
          {typeKicker(opp)}
        </p>

        <h1
          className="mt-2 text-[28px] leading-none tracking-tight text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          {opp.role}
        </h1>
        <p className="mt-1 text-sm text-muted">{opp.employerName}</p>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {isJob ? "Starts " : ""}
            {fmtDate(opportunityDate(opp, demoToday))}
            {hours ? ` · ${hours}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {opp.city}
          </span>
          {opp.hourlyRateCad != null ? (
            <span className="tabular-nums">{fmtMoney(opp.hourlyRateCad)}/hr</span>
          ) : null}
        </div>

        <p
          className="mt-4 text-[42px] leading-none tabular-nums text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          {isJob && opp.weeklyNetCad != null
            ? `${fmtMoney(opp.weeklyNetCad)}/wk net`
            : `${fmtMoney(opp.estimatedNetCad)} est. net`}
        </p>

        {opp.type === "released-shift" && opp.releasedBy ? (
          <p className="mt-2 text-xs text-muted">
            Released by {opp.releasedBy}
            {opp.releaseReason ? ` · ${opp.releaseReason}` : ""}
          </p>
        ) : null}
        {opp.note ? <p className="mt-2 text-xs text-muted">{opp.note}</p> : null}

        <div className="mt-4">
          <ClaimButton opportunityId={opp.id} />
        </div>
      </section>

      <hr className="section-rule" />

      {isJob ? (
        <section className="px-5 py-5">
          <h2
            className="text-[17px] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            What this job means for you
          </h2>
          {surplus != null ? (
            <>
              <p className="mt-2 text-sm text-[var(--color-text)]">
                Projected{" "}
                <span className="tabular-nums font-semibold">{fmtMoney(Math.abs(surplus))}</span>{" "}
                {surplus >= 0 ? "above" : "below"} monthly obligations
              </p>
              <p className="mt-1 text-xs text-muted">
                {surplus >= 0
                  ? "This role meets your income needs — it covers your recurring bills and essential spending with room left over."
                  : "This role does not fully cover your recurring bills and essential spending on its own."}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-muted">No weekly income estimate available.</p>
          )}
        </section>
      ) : basePlan.goal ? (
        <section className="px-5 py-5">
          <h2
            className="text-[17px] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            Before / after
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="border-2 border-[var(--color-divider)] bg-[var(--color-surface)] p-3">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted">Before</div>
              <div
                className="mt-1 text-lg tabular-nums text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
              >
                {fmtMoney(impact.gapBeforeCad)} short
              </div>
            </div>
            <div className="border-2 border-[var(--color-divider)] bg-[var(--color-surface)] p-3">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted">After</div>
              <div
                className={`mt-1 text-lg tabular-nums ${
                  impact.gapAfterCad === 0
                    ? "text-[var(--color-accent-700)]"
                    : "text-[var(--color-text)]"
                }`}
                style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
              >
                {impact.gapAfterCad === 0 ? "Goal met" : `${fmtMoney(impact.gapAfterCad)} short`}
              </div>
            </div>
          </div>
          {paysAfterGoal ? (
            <p className="mt-3 text-xs text-[var(--color-accent-700)]">
              Pays out {fmtDate(payoutDate)} — after your goal date
            </p>
          ) : null}
          <div className="mt-3 space-y-1 text-xs text-muted">
            {impact.closesGap ? (
              <p className="font-medium text-[var(--color-accent-700)]">Closes your goal completely.</p>
            ) : null}
            <p>
              Pays on {fmtDate(payoutDate)}
              {opp.payoutDaysAfter === 0 ? " (same day)" : ""}
            </p>
          </div>
        </section>
      ) : (
        <section className="px-5 py-5">
          <h2
            className="text-[17px] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            Before / after
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="border-2 border-[var(--color-divider)] bg-[var(--color-surface)] p-3">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted">Gap before</div>
              <div
                className={`mt-1 text-lg tabular-nums ${
                  impact.gapBeforeCad > 0 ? "text-[var(--color-accent-700)]" : "text-[var(--color-text)]"
                }`}
                style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
              >
                {fmtMoney(impact.gapBeforeCad)}
              </div>
            </div>
            <div className="border-2 border-[var(--color-divider)] bg-[var(--color-surface)] p-3">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted">Gap after</div>
              <div
                className={`mt-1 text-lg tabular-nums ${
                  impact.gapAfterCad === 0
                    ? "text-[var(--color-accent-700)]"
                    : impact.gapAfterCad > 0
                      ? "text-[var(--color-accent-700)]"
                      : "text-[var(--color-text)]"
                }`}
                style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
              >
                {fmtMoney(impact.gapAfterCad)}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1 text-xs text-muted">
            {impact.closesGap ? (
              <p className="font-medium text-[var(--color-accent-700)]">
                Closes your cash gap completely.
              </p>
            ) : null}
            <p>
              +<span className="tabular-nums">{impact.bufferDaysGained}</span> buffer days · pays
              on {fmtDate(payoutDate)}
              {opp.payoutDaysAfter === 0 ? " (same day)" : ""}
            </p>
          </div>
        </section>
      )}

      {ewa ? (
        <>
          <hr className="section-rule" />
          <section className="px-5 py-5">
            <h2
              className="flex items-center gap-1.5 text-[17px] text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
            >
              <Zap className="h-3.5 w-3.5 text-[var(--color-accent-700)]" /> Advance vs this shift
            </h2>
            <p className="mt-1 text-xs text-muted">
              You have a <span className="tabular-nums">{fmtMoney(ewa.gapCad)}</span> gap. Two ways
              to cover it:
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="border-2 border-[var(--color-divider)] bg-[var(--color-surface)] p-3">
                <div
                  className="text-[10px] uppercase tracking-[0.08em] text-muted"
                  style={{ fontWeight: 800 }}
                >
                  Take an advance
                </div>
                <div className="mt-2 space-y-1 text-muted">
                  <p>
                    <span className="tabular-nums text-[var(--color-text)]">
                      {fmtMoney(ewa.advance.amountCad)}
                    </span>{" "}
                    now
                  </p>
                  <p className="text-[var(--color-accent-700)]">
                    <span className="tabular-nums">{fmtMoney(ewa.advance.feeCad)}</span> fee (
                    {ewa.advance.feeRatePct}%)
                  </p>
                  <p>Repay {fmtDate(ewa.advance.repaymentDate)}</p>
                  <p>
                    Gap after repayment:{" "}
                    <span className="tabular-nums">{fmtMoney(ewa.advance.residualGapCad)}</span>
                  </p>
                </div>
              </div>
              <div className="border-2 border-[var(--color-accent)] bg-[var(--color-accent-100)] p-3">
                <div
                  className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-accent-700)]"
                  style={{ fontWeight: 800 }}
                >
                  Work this shift
                </div>
                {ewa.shift ? (
                  <div className="mt-2 space-y-1 text-muted">
                    <p>
                      <span className="tabular-nums text-[var(--color-text)]">
                        {fmtMoney(ewa.shift.netCad)}
                      </span>{" "}
                      earned
                    </p>
                    <p className="text-[var(--color-accent-700)]">No fee</p>
                    <p>Paid {fmtDate(ewa.shift.payoutDate)}</p>
                    <p>
                      Gap left:{" "}
                      <span className="tabular-nums">{fmtMoney(ewa.shift.residualGapCad)}</span>
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-muted">No shift comparison available.</p>
                )}
              </div>
            </div>
            {ewa.advance.historyCount > 0 ? (
              <p className="mt-3 text-[11px] text-muted">
                You&apos;ve taken {ewa.advance.historyCount} advance
                {ewa.advance.historyCount === 1 ? "" : "s"} totalling{" "}
                <span className="tabular-nums">{fmtMoney(ewa.advance.historyFeesCad)}</span> in
                fees.
              </p>
            ) : null}
          </section>
        </>
      ) : null}

      <hr className="section-rule" />
      <MatchScoreBreakdown score={score} />

      {opp.requiredOccupations && opp.requiredOccupations.length > 0 ? (
        <>
          <hr className="section-rule" />
          <section className="px-5 py-5">
            <h2
              className="text-[17px] text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
            >
              Required roles
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {opp.requiredOccupations.map((r) => (
                <span
                  key={r}
                  className={`tag ${
                    r === worker.occupation ? "tag-outline" : "tag-neutral"
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
