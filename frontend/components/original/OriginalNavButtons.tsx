"use client";

import { usePipelineStore } from "@/lib/store/usePipelineStore";
import type { StageId } from "@/lib/engine/types";

export function OriginalNextButton({ stage, label }: { stage: StageId; label: string }) {
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  return (
    <button
      onClick={() => setActiveStage(stage)}
      className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90"
    >
      Next: {label} →
    </button>
  );
}

export function OriginalBackButton({ stage, label }: { stage: StageId; label: string }) {
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  return (
    <button
      onClick={() => setActiveStage(stage)}
      className="rounded-full border border-graphite-dim px-5 py-2 font-mono text-xs uppercase tracking-wider text-graphite hover:text-paper"
    >
      ← Back to {label}
    </button>
  );
}