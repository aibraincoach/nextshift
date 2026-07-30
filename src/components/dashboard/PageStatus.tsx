"use client";

export function LoadingPlan() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading your plan">
      <p className="text-sm text-zinc-400">Loading your plan…</p>
      <div className="h-36 rounded-2xl bg-zinc-900" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-20 rounded-xl bg-zinc-900" />
        <div className="h-20 rounded-xl bg-zinc-900" />
        <div className="h-20 rounded-xl bg-zinc-900" />
        <div className="h-20 rounded-xl bg-zinc-900" />
      </div>
      <div className="h-44 rounded-xl bg-zinc-900" />
    </div>
  );
}

export function ErrorPlan({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4">
      <h2 className="text-sm font-semibold text-rose-300">Couldn&apos;t load your plan</h2>
      <p className="mt-1 text-sm text-zinc-400">{message}</p>
    </div>
  );
}

export function EmptyWorker() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="text-sm font-semibold text-zinc-200">No worker selected</h2>
      <p className="mt-1 text-sm text-zinc-500">Pick a demo persona above to see their cash plan.</p>
    </div>
  );
}
