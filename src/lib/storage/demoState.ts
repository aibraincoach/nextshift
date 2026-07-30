"use client";

import { useCallback, useSyncExternalStore } from "react";

export interface DemoState {
  selectedWorkerId: string | null;
  claimedOpportunityIds: string[];
  releasedShiftIds: string[]; // assigned shifts the worker released
  savingsRate: number; // 0, 0.02, 0.05, or custom
  postedOpportunities: PostedOpportunity[];
}

export interface PostedOpportunity {
  id: string;
  type: "shift" | "job";
  employerName: string;
  role: string;
  city: string;
  dayOffset: number;
  startHour?: number;
  endHour?: number;
  hourlyRateCad?: number;
  estimatedNetCad: number;
  weeklyNetCad?: number;
  requiredOccupations: string[];
  payoutDaysAfter: number;
}

const KEY = "nextshift-demo-state-v1";

const DEFAULT_STATE: DemoState = {
  selectedWorkerId: null,
  claimedOpportunityIds: [],
  releasedShiftIds: [],
  savingsRate: 0,
  postedOpportunities: [],
};

let cache: DemoState = DEFAULT_STATE;
let cacheRaw: string | null = null;
const listeners = new Set<() => void>();

function read(): DemoState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    cache = DEFAULT_STATE;
  }
  return cache;
}

function write(next: DemoState) {
  cache = next;
  cacheRaw = JSON.stringify(next);
  window.localStorage.setItem(KEY, cacheRaw);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDemoState() {
  const state = useSyncExternalStore(subscribe, read, () => DEFAULT_STATE);

  const update = useCallback((patch: Partial<DemoState>) => {
    write({ ...read(), ...patch });
  }, []);

  const claim = useCallback((id: string) => {
    const s = read();
    if (!s.claimedOpportunityIds.includes(id)) {
      write({ ...s, claimedOpportunityIds: [...s.claimedOpportunityIds, id] });
    }
  }, []);

  const unclaim = useCallback((id: string) => {
    const s = read();
    write({ ...s, claimedOpportunityIds: s.claimedOpportunityIds.filter((x) => x !== id) });
  }, []);

  const releaseShift = useCallback((id: string) => {
    const s = read();
    if (!s.releasedShiftIds.includes(id)) {
      write({ ...s, releasedShiftIds: [...s.releasedShiftIds, id] });
    }
  }, []);

  const postOpportunity = useCallback((opp: PostedOpportunity) => {
    const s = read();
    write({ ...s, postedOpportunities: [...s.postedOpportunities, opp] });
  }, []);

  const reset = useCallback(() => {
    write(DEFAULT_STATE);
  }, []);

  return { state, update, claim, unclaim, releaseShift, postOpportunity, reset };
}
