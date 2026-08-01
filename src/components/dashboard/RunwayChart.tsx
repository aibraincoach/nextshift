"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayProjection } from "@/types";
import { fmtDate, fmtMoney } from "@/lib/engine/plan";

/** Read Modernist tokens so the chart cannot drift from the design system. */
function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function RunwayChart({
  projection,
  bufferTargetCad,
}: {
  projection: DayProjection[];
  bufferTargetCad: number;
}) {
  const data = projection.map((d) => ({
    ...d,
    label: fmtDate(d.date),
  }));

  const ink = cssVar("--color-text", "#201e1d");
  const accent = cssVar("--color-accent", "#ec3013");
  const neutral200 = cssVar("--color-neutral-200", "#eae7e7");
  const neutral500 = cssVar("--color-neutral-500", "#9b9797");
  const neutral600 = cssVar("--color-neutral-600", "#7d7979");
  const surface = cssVar("--color-surface", "#eae9e9");
  const divider = cssVar("--color-divider", "rgba(32,30,29,0.4)");

  return (
    <section className="px-5 py-5">
      <h2
        className="text-base text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
      >
        {projection.length}-day runway
      </h2>

      <div className="mt-4 h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="runwayFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={neutral200} stopOpacity={0.9} />
                <stop offset="100%" stopColor={neutral200} stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={neutral200} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: neutral600, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fill: neutral600, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(v: number) => `$${Math.round(v)}`}
            />
            <Tooltip
              contentStyle={{
                background: surface,
                border: `1px solid ${divider}`,
                borderRadius: 0,
                fontSize: 12,
                color: ink,
              }}
              labelStyle={{ color: neutral500 }}
              formatter={(value) => [fmtMoney(Number(value ?? 0)), "Balance"]}
            />
            <ReferenceLine
              y={bufferTargetCad}
              stroke={accent}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="endingBalanceCad"
              stroke={ink}
              strokeWidth={2}
              fill="url(#runwayFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[var(--color-neutral-600)]">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-0.5 w-5 bg-[var(--color-text)]" />
          Balance
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-0 w-5 border-t-2 border-dashed border-[var(--color-accent)]" />
          Buffer {fmtMoney(bufferTargetCad)}
        </span>
      </div>
    </section>
  );
}
