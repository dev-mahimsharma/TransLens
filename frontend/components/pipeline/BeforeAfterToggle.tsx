"use client";

import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { cn } from "@/lib/utils";

/**
 * A simple toggle, but it's what turns on ghost-comparison rendering in
 * whichever stage view is currently active. Disabled when there's no
 * previous snapshot to compare against -- comparison mode needs at least
 * one edit in history first.
 */
export function BeforeAfterToggle() {
  const compareEnabled = usePipelineStore((s) => s.compareEnabled);
  const toggleCompare = usePipelineStore((s) => s.toggleCompare);
  const hasPrevious = usePipelineStore((s) => s.previousSnapshot() !== null);

  return (
    <button
      onClick={toggleCompare}
      disabled={!hasPrevious}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
        !hasPrevious && "cursor-not-allowed opacity-30",
        compareEnabled
          ? "border-signal-violet bg-signal-violet/10 text-signal-violet"
          : "border-graphite-dim text-graphite hover:text-paper"
      )}
      title={hasPrevious ? "Ghost the previous state behind the current one" : "No previous state to compare yet"}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", compareEnabled ? "bg-signal-violet" : "bg-graphite-dim")} />
      Before / After
    </button>
  );
}