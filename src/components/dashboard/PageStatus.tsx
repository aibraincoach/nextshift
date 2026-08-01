"use client";

export function LoadingPlan() {
  return (
    <div className="animate-pulse px-5 py-6" aria-busy="true" aria-label="Loading your plan">
      <p className="text-sm text-[var(--color-neutral-600)]">Loading your plan…</p>
      <div className="mt-4 h-36 bg-[var(--color-surface)]" />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="h-16 bg-[var(--color-surface)]" />
        <div className="h-16 bg-[var(--color-surface)]" />
        <div className="h-16 bg-[var(--color-surface)]" />
      </div>
      <div className="mt-4 h-44 bg-[var(--color-surface)]" />
    </div>
  );
}

export function ErrorPlan({ message }: { message: string }) {
  return (
    <div className="mx-5 mt-6 border border-[var(--color-accent)] bg-[var(--color-accent-100)] p-4">
      <h2
        className="text-sm text-[var(--color-accent-800)]"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
      >
        Couldn&apos;t load your plan
      </h2>
      <p className="mt-1 text-sm text-[var(--color-neutral-700)]">{message}</p>
    </div>
  );
}

export function EmptyWorker() {
  return (
    <div className="px-5 py-6">
      <h2
        className="text-base text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
      >
        No worker selected
      </h2>
      <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
        Pick a demo persona above to see their cash plan.
      </p>
    </div>
  );
}
