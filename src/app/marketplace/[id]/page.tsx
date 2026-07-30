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
    // If this opportunity is already claimed, its payout is baked into
    // planOptions; remove one matching entry so before/after stays meaningful.
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
    return <p className="py-16 text-center text-sm text-zinc-500">Loading opportunity…</p>;
  }
  if (error) {
    return <p className="py-16 text-center text-sm text-rose-400">Something went wrong: {error}</p>;
  }
  if (!opp || !worker || !financials || !computed) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-sm text-zinc-400">This opportunity no longer exists.</p>
        <Link
          href="/marketplace"
          className="inline-block rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
        >
          Back to marketplace
        </Link>
      </div>
    );
  }

  const { score, impact, ewa, basePlan } = computed;
  const hours = hoursLabel(opp);
  const isJob = opp.type === "job";
  const surplus = isJob && opp.weeklyNetCad != null ? jobMonthlySurplus(financials, opp.weeklyNetCad) : null;
  const payoutDate = opportunityPayoutDate(opp, demoToday);
  const paysAfterGoal =
    basePlan.goal != null && payoutDate > basePlan.goal.byDate;

  return (
    <div className="space-y-4">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to marketplace
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-zinc-100">{opp.role}</h1>
            <p className="text-sm text-zinc-400">{opp.employerName}</p>
          </div>
          <span className="shrink-0 rounded-full border border-zinc-700 px-2.5 py-1 text-xs font-semibold tabular-nums text-zinc-300">
            {score.total}% match
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-400">
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
        <div className="mt-3 text-2xl font-bold tabular-nums text-zinc-100">
          {isJob && opp.weeklyNetCad != null
            ? `${fmtMoney(opp.weeklyNetCad)}/wk net`
            : `${fmtMoney(opp.estimatedNetCad)} est. net`}
        </div>
        {opp.type === "released-shift" && opp.releasedBy ? (
          <p className="mt-2 text-xs text-zinc-500">
            Released by {opp.releasedBy}
            {opp.releaseReason ? ` · ${opp.releaseReason}` : ""}
          </p>
        ) : null}
        {opp.note ? <p className="mt-2 text-xs text-zinc-500">{opp.note}</p> : null}
      </div>

      <ClaimButton opportunityId={opp.id} />

      {/* Before / after */}
      {isJob ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">What this job means for you</h2>
          {surplus != null ? (
            <>
              <p
                className={`mt-2 text-sm ${surplus >= 0 ? "text-emerald-400" : "text-amber-400"}`}
              >
                Projected <span className="font-bold tabular-nums">{fmtMoney(Math.abs(surplus))}</span>{" "}
                {surplus >= 0 ? "above" : "below"} monthly obligations
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {surplus >= 0
                  ? "This role meets your income needs — it covers your recurring bills and essential spending with room left over."
                  : "This role does not fully cover your recurring bills and essential spending on its own."}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">No weekly income estimate available.</p>
          )}
        </div>
      ) : basePlan.goal ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Before / after</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Toward your {fmtMoney(basePlan.goal.amountCad)} by {fmtDate(basePlan.goal.byDate)}:{" "}
            {impact.gapAfterCad === 0 ? (
              <span className="font-semibold text-emerald-400">
                {fmtMoney(impact.gapBeforeCad)} short → goal met
              </span>
            ) : (
              <span className="font-semibold tabular-nums">
                <span className={impact.gapBeforeCad > 0 ? "text-amber-400" : "text-zinc-100"}>
                  {fmtMoney(impact.gapBeforeCad)} short
                </span>
                {" → "}
                <span className={impact.gapAfterCad > 0 ? "text-amber-400" : "text-emerald-400"}>
                  {fmtMoney(impact.gapAfterCad)} short
                </span>
              </span>
            )}
          </p>
          {paysAfterGoal ? (
            <p className="mt-2 text-xs font-medium text-amber-300">
              Pays out {fmtDate(payoutDate)} — after your goal date
            </p>
          ) : null}
          <div className="mt-3 space-y-1 text-xs text-zinc-400">
            {impact.closesGap ? (
              <p className="font-medium text-emerald-400">Closes your goal completely.</p>
            ) : null}
            <p>
              Pays on {fmtDate(payoutDate)}
              {opp.payoutDaysAfter === 0 ? " (same day)" : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Before / after</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-zinc-800/60 p-3">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Gap before</div>
              <div
                className={`mt-1 text-lg font-bold tabular-nums ${
                  impact.gapBeforeCad > 0 ? "text-amber-400" : "text-zinc-100"
                }`}
              >
                {fmtMoney(impact.gapBeforeCad)}
              </div>
            </div>
            <div className="rounded-lg bg-zinc-800/60 p-3">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Gap after</div>
              <div
                className={`mt-1 text-lg font-bold tabular-nums ${
                  impact.gapAfterCad === 0 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {fmtMoney(impact.gapAfterCad)}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1 text-xs text-zinc-400">
            {impact.closesGap ? (
              <p className="font-medium text-emerald-400">Closes your cash gap completely.</p>
            ) : null}
            <p>
              +<span className="tabular-nums">{impact.bufferDaysGained}</span> buffer days ·
              pays on {fmtDate(payoutDate)}
              {opp.payoutDaysAfter === 0 ? " (same day)" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Advance vs this shift */}
      {ewa ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-200">
            <Zap className="h-3.5 w-3.5 text-amber-400" /> Advance vs this shift
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            You have a <span className="tabular-nums">{fmtMoney(ewa.gapCad)}</span> gap. Two ways to
            cover it:
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-3">
              <div className="font-semibold text-zinc-300">Take an advance</div>
              <div className="mt-2 space-y-1 text-zinc-400">
                <p>
                  <span className="tabular-nums">{fmtMoney(ewa.advance.amountCad)}</span> now
                </p>
                <p className="text-amber-400">
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
            <div className="rounded-lg border border-emerald-800/60 bg-emerald-500/5 p-3">
              <div className="font-semibold text-emerald-300">Work this shift</div>
              {ewa.shift ? (
                <div className="mt-2 space-y-1 text-zinc-400">
                  <p>
                    <span className="tabular-nums">{fmtMoney(ewa.shift.netCad)}</span> earned
                  </p>
                  <p className="text-emerald-400">No fee</p>
                  <p>Paid {fmtDate(ewa.shift.payoutDate)}</p>
                  <p>
                    Gap left:{" "}
                    <span className="tabular-nums">{fmtMoney(ewa.shift.residualGapCad)}</span>
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-zinc-500">No shift comparison available.</p>
              )}
            </div>
          </div>
          {ewa.advance.historyCount > 0 ? (
            <p className="mt-3 text-[11px] text-zinc-500">
              You&apos;ve taken {ewa.advance.historyCount} advance
              {ewa.advance.historyCount === 1 ? "" : "s"} totalling{" "}
              <span className="tabular-nums">{fmtMoney(ewa.advance.historyFeesCad)}</span> in fees.
            </p>
          ) : null}
        </div>
      ) : null}

      <MatchScoreBreakdown score={score} />

      {opp.requiredOccupations && opp.requiredOccupations.length > 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Required roles</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {opp.requiredOccupations.map((r) => (
              <span
                key={r}
                className={`rounded-full border px-2 py-0.5 text-[11px] ${
                  r === worker.occupation
                    ? "border-emerald-700 text-emerald-300"
                    : "border-zinc-700 text-zinc-400"
                }`}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
