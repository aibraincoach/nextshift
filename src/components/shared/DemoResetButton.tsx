"use client";

import { RotateCcw } from "lucide-react";
import { useDemoState } from "@/lib/storage/demoState";

export function DemoResetButton() {
  const { reset } = useDemoState();
  return (
    <button
      onClick={reset}
      className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-500 hover:text-zinc-300"
    >
      <RotateCcw size={12} />
      Reset demo
    </button>
  );
}
