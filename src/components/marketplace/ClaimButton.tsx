"use client";

import { CheckCircle2 } from "lucide-react";
import { useDemoState } from "@/lib/storage/demoState";

export function ClaimButton({ opportunityId }: { opportunityId: string }) {
  const { state, claim, unclaim } = useDemoState();
  const claimed = state.claimedOpportunityIds.includes(opportunityId);

  if (claimed) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Claimed — pending employer approval
        </div>
        <button
          onClick={() => unclaim(opportunityId)}
          className="w-full rounded-xl border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
        >
          Cancel claim
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => claim(opportunityId)}
      className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
    >
      Claim this opportunity
    </button>
  );
}
