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

const INK = "#201e1d";
const ACCENT = "#ec3013";
const NEUTRAL_200 = "#eae7e7";
const NEUTRAL_500 = "#9b9797";
const NEUTRAL_600 = "#7d7979";
const SURFACE = "#eae9e9";
const DIVIDER = "color-mix(in srgb, #201e1d 40%, transparent)";

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
                <stop offset="0%" stopColor={NEUTRAL_200} stopOpacity={0.9} />
                <stop offset="100%" stopColor={NEUTRAL_200} stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={NEUTRAL_200} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: NEUTRAL_600, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fill: NEUTRAL_600, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(v: number) => `$${Math.round(v)}`}
            />
            <Tooltip
              contentStyle={{
                background: SURFACE,
                border: `1px solid ${DIVIDER}`,
                borderRadius: 0,
                fontSize: 12,
                color: INK,
              }}
              labelStyle={{ color: NEUTRAL_500 }}
              formatter={(value) => [fmtMoney(Number(value ?? 0)), "Balance"]}
            />
            <ReferenceLine
              y={bufferTargetCad}
              stroke={ACCENT}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="endingBalanceCad"
              stroke={INK}
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
          <span
            className="inline-block h-0 w-5 border-t-2 border-dashed border-[var(--color-accent)]"
          />
          Buffer {fmtMoney(bufferTargetCad)}
        </span>
      </div>
    </section>
  );
}
