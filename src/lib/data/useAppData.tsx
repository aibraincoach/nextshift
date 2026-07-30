"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppData, Opportunity, Worker, WorkerFinancials } from "@/types";
import { useDemoState, type PostedOpportunity } from "@/lib/storage/demoState";
import { addDays, opportunityPayoutDate, type PlanOptions } from "@/lib/engine/plan";

interface FixtureFile {
  opportunities: Opportunity[];
}

interface AppDataContextValue {
  loading: boolean;
  error: string | null;
  data: AppData | null;
  opportunities: Opportunity[]; // fixtures + employer-posted + worker-released
  worker: Worker | null; // selected persona
  financials: WorkerFinancials | null;
  demoToday: string;
  /** PlanOptions reflecting current claimed/released/savings state */
  planOptions: PlanOptions;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [fixtures, setFixtures] = useState<Opportunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { state } = useDemoState();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/generated/app-data.json").then((r) => {
        if (!r.ok) throw new Error("Failed to load app data");
        return r.json() as Promise<AppData>;
      }),
      fetch("/fixtures/opportunities.json").then((r) => {
        if (!r.ok) throw new Error("Failed to load fixtures");
        return r.json() as Promise<FixtureFile>;
      }),
    ])
      .then(([app, fix]) => {
        if (cancelled) return;
        setData(app);
        setFixtures(fix.opportunities);
      })
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AppDataContextValue>(() => {
    const demoToday = data?.demoToday ?? "2026-07-06";
    const selectedId = state.selectedWorkerId ?? data?.personaIds[0] ?? null;
    const worker = data?.workers.find((w) => w.workerId === selectedId) ?? null;
    const financials = selectedId ? (data?.financials[selectedId] ?? null) : null;

    const posted: Opportunity[] = state.postedOpportunities.map((p: PostedOpportunity) => ({
      ...p,
      employerId: "EMP-POSTED",
    }));

    // Shifts the selected worker released become marketplace released-shifts.
    const released: Opportunity[] = (financials?.assignedShifts ?? [])
      .filter((s) => state.releasedShiftIds.includes(s.id))
      .map((s) => ({
        id: `REL-${s.id}`,
        type: "released-shift" as const,
        employerId: s.employerId,
        employerName: s.employerName,
        role: s.role,
        city: worker?.city ?? "Calgary",
        dayOffset: Math.round(
          (new Date(s.date).getTime() - new Date(demoToday).getTime()) / 86400000
        ),
        startHour: s.startHour,
        endHour: s.endHour,
        estimatedNetCad: s.estimatedNetCad,
        requiredOccupations: [s.role],
        payoutDaysAfter: 0,
        releasedBy: "You",
        releaseReason: "Released by you",
      }));

    const opportunities = [...fixtures, ...posted, ...released];

    const claimed = opportunities.filter(
      (o) => state.claimedOpportunityIds.includes(o.id) && o.type !== "job"
    );
    const releasedIncome = (financials?.assignedShifts ?? [])
      .filter((s) => state.releasedShiftIds.includes(s.id))
      .map((s) => ({ date: s.date, netCad: s.estimatedNetCad }));

    const planOptions: PlanOptions = {
      extraIncome: claimed.map((o) => ({
        date: opportunityPayoutDate(o, demoToday),
        netCad: o.estimatedNetCad,
      })),
      removedIncome: releasedIncome,
      savingsRate: state.savingsRate,
    };

    return {
      loading: !data && !error,
      error,
      data,
      opportunities,
      worker,
      financials,
      demoToday,
      planOptions,
    };
  }, [data, fixtures, error, state]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}

export { addDays };
