"use client";

import { useAppData } from "@/lib/data/useAppData";
import { useDemoState } from "@/lib/storage/demoState";

const PERSONA_BLURBS: Record<string, string> = {
  "W-0014": "Gig delivery · Calgary",
  "W-0087": "Cleaner · Calgary",
  "W-0183": "Event staff · Edmonton",
};

export function WorkerSwitcher() {
  const { data, worker } = useAppData();
  const { update } = useDemoState();
  if (!data) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {data.personaIds.map((id) => {
        const w = data.workers.find((x) => x.workerId === id);
        const active = worker?.workerId === id;
        return (
          <button
            key={id}
            onClick={() => update({ selectedWorkerId: id })}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {PERSONA_BLURBS[id] ?? `${w?.occupation} · ${w?.city}`}
          </button>
        );
      })}
    </div>
  );
}
