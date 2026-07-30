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

const inputCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500";
const labelCls = "mb-1 block text-xs font-medium text-zinc-400";

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
      <div className="rounded-xl border border-emerald-500/30 bg-zinc-900 p-5">
        <div className="mb-3 flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-semibold">
            {summary.type === "shift" ? "Shift" : "Job"} posted: {summary.role} ({summary.city})
          </p>
        </div>
        <div className="space-y-1.5 text-sm text-zinc-300">
          <p>
            <span className="font-semibold text-zinc-100">{summary.eligible}</span> eligible
            workers in {summary.city}
          </p>
          <p>
            <span className="font-semibold text-zinc-100">{summary.withGap}</span> have a
            predicted cash gap within seven days
          </p>
          <p>
            <span className="font-semibold text-zinc-100">{summary.roleCityMatch}</span> match
            the role and city
          </p>
        </div>
        <p className="mt-3 text-xs text-zinc-600">
          Aggregate counts only. Workers&apos; budgets are never shared.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/marketplace"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            View in marketplace
          </Link>
          <button
            type="button"
            onClick={() => {
              setSummary(null);
              setRole("");
            }}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
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
    <div>
      <div className="mb-4 flex gap-2">
        {(["shift", "job"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t
                ? "bg-zinc-800 text-zinc-100"
                : "border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t === "shift" ? "Post shift" : "Post job"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div>
          <label className={labelCls} htmlFor="role">
            Role
          </label>
          <input
            id="role"
            className={inputCls}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder={tab === "shift" ? "e.g. Warehouse associate" : "e.g. Forklift operator"}
            required
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="city">
            City
          </label>
          <select id="city" className={inputCls} value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {tab === "shift" ? (
          <>
            <div>
              <label className={labelCls} htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                className={inputCls}
                value={date}
                min={demoToday}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="start">
                  Start hour (0–23)
                </label>
                <input
                  id="start"
                  type="number"
                  min={0}
                  max={23}
                  className={inputCls}
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="end">
                  End hour (0–23)
                </label>
                <input
                  id="end"
                  type="number"
                  min={0}
                  max={23}
                  className={inputCls}
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className={labelCls} htmlFor="hpw">
              Hours per week
            </label>
            <input
              id="hpw"
              type="number"
              min={1}
              max={60}
              className={inputCls}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            />
          </div>
        )}

        <div>
          <label className={labelCls} htmlFor="rate">
            Hourly rate (CAD)
          </label>
          <input
            id="rate"
            type="number"
            min={15}
            max={80}
            step="0.5"
            className={inputCls}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>

        <p className="text-xs text-zinc-500">
          Estimated {tab === "shift" ? "net pay" : "weekly net"} for workers:{" "}
          <span className="font-medium text-zinc-300">{fmtMoney(estNet)}</span>
        </p>

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          {tab === "shift" ? "Post shift" : "Post job"}
        </button>
      </form>
    </div>
  );
}
