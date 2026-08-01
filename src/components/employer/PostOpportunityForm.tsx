"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { AppData } from "@/types";
import { useDemoState, type PostedOpportunity } from "@/lib/storage/demoState";
import { fmtMoney } from "@/lib/engine/plan";
import { computeMarketStats } from "@/components/employer/MarketSnapshot";

const CITIES = ["Calgary", "Edmonton", "Red Deer"] as const;

interface MatchSummary {
  eligible: number;
  withGap: number;
  roleCityMatch: number;
  role: string;
  city: string;
  type: "shift" | "job";
}

function roleMatchesOccupation(role: string, occupation: string): boolean {
  const r = role.toLowerCase();
  const o = occupation.toLowerCase();
  const words = r.split(/[^a-z]+/).filter((w) => w.length >= 4);
  return words.some((w) => o.includes(w)) || r.includes(o);
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (new Date(toIso + "T12:00:00").getTime() - new Date(fromIso + "T12:00:00").getTime()) / 86400000
  );
}

export function PostOpportunityForm({ data, demoToday }: { data: AppData; demoToday: string }) {
  const { postOpportunity } = useDemoState();
  const stats = useMemo(() => computeMarketStats(data), [data]);

  const [tab, setTab] = useState<"shift" | "job">("shift");
  const [role, setRole] = useState("");
  const [city, setCity] = useState<string>("Calgary");
  const [date, setDate] = useState(demoToday);
  const [startHour, setStartHour] = useState(17);
  const [endHour, setEndHour] = useState(22);
  const [rate, setRate] = useState(20);
  const [hoursPerWeek, setHoursPerWeek] = useState(35);
  const [summary, setSummary] = useState<MatchSummary | null>(null);

  function buildSummary(type: "shift" | "job"): MatchSummary {
    const inCity = data.workers.filter((w) => w.city === city);
    const withGap = inCity.filter((w) => stats.gapByWorker.get(w.workerId)).length;
    const roleMatches = inCity.filter((w) => roleMatchesOccupation(role, w.occupation)).length;
    return {
      eligible: inCity.length,
      withGap,
      roleCityMatch: Math.min(withGap, roleMatches),
      role,
      city,
      type,
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim()) return;

    let opp: PostedOpportunity;
    if (tab === "shift") {
      const hours = Math.max(0, endHour - startHour);
      opp = {
        id: `POSTED-${Date.now()}`,
        type: "shift",
        employerName: "Chinook Warehousing",
        role: role.trim(),
        city,
        dayOffset: Math.max(0, daysBetween(demoToday, date)),
        startHour,
        endHour,
        hourlyRateCad: rate,
        estimatedNetCad: Math.round(hours * rate * 0.82),
        requiredOccupations: [],
        payoutDaysAfter: 0,
      };
    } else {
      const weeklyNet = Math.round(rate * hoursPerWeek * 0.82);
      opp = {
        id: `POSTED-${Date.now()}`,
        type: "job",
        employerName: "Chinook Warehousing",
        role: role.trim(),
        city,
        dayOffset: 14,
        hourlyRateCad: rate,
        estimatedNetCad: weeklyNet,
        weeklyNetCad: weeklyNet,
        requiredOccupations: [],
        payoutDaysAfter: 14,
      };
    }
    postOpportunity(opp);
    setSummary(buildSummary(tab));
  }

  if (summary) {
    return (
      <div className="mx-5 border-2 border-[var(--color-divider)] bg-[var(--color-surface)] p-5">
        <div className="mb-3 flex items-center gap-2 text-[var(--color-accent)]">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>
            {summary.type === "shift" ? "Shift" : "Job"} posted: {summary.role} ({summary.city})
          </p>
        </div>
        <div className="space-y-1.5 text-sm text-[var(--color-text)]">
          <p>
            <span className="tabular-nums font-semibold">{summary.eligible}</span> eligible workers
            in {summary.city}
          </p>
          <p>
            <span className="tabular-nums font-semibold">{summary.withGap}</span> have a predicted
            cash gap within seven days
          </p>
          <p>
            <span className="tabular-nums font-semibold">{summary.roleCityMatch}</span> match the
            role and city
          </p>
        </div>
        <p className="mt-3 text-xs text-muted">
          Aggregate counts only. Workers&apos; budgets are never shared.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/marketplace" className="btn btn-primary">
            View in marketplace
          </Link>
          <button
            type="button"
            onClick={() => {
              setSummary(null);
              setRole("");
            }}
            className="btn btn-secondary"
          >
            Post another
          </button>
        </div>
      </div>
    );
  }

  const estNet =
    tab === "shift"
      ? Math.round(Math.max(0, endHour - startHour) * rate * 0.82)
      : Math.round(rate * hoursPerWeek * 0.82);

  return (
    <div className="px-5">
      <div className="seg mb-4 w-full">
        {(["shift", "job"] as const).map((t) => (
          <label key={t} className="seg-opt flex-1 justify-center">
            <input
              type="radio"
              name="post-tab"
              checked={tab === t}
              onChange={() => setTab(t)}
            />
            {t === "shift" ? "Post shift" : "Post job"}
          </label>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="space-y-4 border-2 border-[var(--color-divider)] bg-[var(--color-surface)] p-4"
      >
        <div className="field">
          <label htmlFor="role">Role</label>
          <input
            id="role"
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder={tab === "shift" ? "e.g. Warehouse associate" : "e.g. Forklift operator"}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <select id="city" className="input" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {tab === "shift" ? (
          <>
            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                className="input"
                value={date}
                min={demoToday}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label htmlFor="start">Start hour (0–23)</label>
                <input
                  id="start"
                  type="number"
                  min={0}
                  max={23}
                  className="input"
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label htmlFor="end">End hour (use 24+ for past midnight)</label>
                <input
                  id="end"
                  type="number"
                  min={0}
                  max={47}
                  className="input"
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="field">
            <label htmlFor="hpw">Hours per week</label>
            <input
              id="hpw"
              type="number"
              min={1}
              max={60}
              className="input"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="rate">Hourly rate (CAD)</label>
          <input
            id="rate"
            type="number"
            min={15}
            max={80}
            step="0.5"
            className="input"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>

        <p className="text-xs text-muted">
          Estimated {tab === "shift" ? "net pay" : "weekly net"} for workers:{" "}
          <span className="font-medium text-[var(--color-text)]">{fmtMoney(estNet)}</span>
        </p>

        <button type="submit" className="btn btn-primary btn-block">
          {tab === "shift" ? "Post shift" : "Post job"}
        </button>
      </form>
    </div>
  );
}
