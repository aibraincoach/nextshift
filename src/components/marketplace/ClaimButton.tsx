"use client";

import { CheckCircle2 } from "lucide-react";
import { useDemoState } from "@/lib/storage/demoState";

export function ClaimButton({ opportunityId }: { opportunityId: string }) {
  const { state, claim, unclaim } = useDemoState();
  const claimed = state.claimedOpportunityIds.includes(opportunityId);

  if (claimed) {
    return (
      <div>
        <div className="flex items-center gap-2 border-2 border-[var(--color-divider)] bg-[var(--color-surface)] px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>
            Claimed — pending employer approval
          </span>
        </div>
        <button
          type="button"
          onClick={() => unclaim(opportunityId)}
          className="btn btn-secondary btn-block"
        >
          Cancel claim
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => claim(opportunityId)} className="btn btn-primary btn-block">
      Claim this opportunity
    </button>
  );
}
