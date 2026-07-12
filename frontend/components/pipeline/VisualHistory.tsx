"use client";

import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { cn } from "@/lib/utils";

/**
 * Shows the path from the root snapshot down to whichever one is active --
 * still reads as a simple line, because you can only be looking at one
 * branch at a time, but it's now a path through a tree rather than a
 * flat array. Switching between different branches entirely is
 * BranchSwitcher's job, not this component's.
 */
export function VisualHistory() {
  const path = usePipelineStore((s) => s.pathToActive());
  const jumpToSnapshot = usePipelineStore((s) => s.jumpToSnapshot);
  const activeHasSibling = usePipelineStore((s) => s.activeHasSibling());

  if (path.length <= 1) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-graphite">
        History — {path.length} states on this branch
      </p>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {path.map((snap, i) => {
          const isActive = i === path.length - 1;
          const isEdit = snap.origin !== null;
          return (
            <button
              key={snap.id}
              onClick={() => jumpToSnapshot(snap.id)}
              title={snap.origin?.description ?? "Original run"}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1.5 rounded-lg border px-3 py-2 transition-all",
                isActive
                  ? isEdit
                    ? "border-signal-violet bg-signal-violet/10 shadow-glow-violet"
                    : "border-signal-cyan bg-signal-cyan/10 shadow-glow-cyan"
                  : "border-graphite-dim bg-void-raised hover:border-graphite"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", isEdit ? "bg-signal-violet" : "bg-signal-cyan")} />
              <span className="whitespace-nowrap font-mono text-[10px] text-graphite">
                {i === 0 ? "Original" : `Edit ${i}`}
              </span>
            </button>
          );
        })}
      </div>
      {activeHasSibling && (
        <p className="mt-1 font-mono text-[10px] text-signal-violet">
          This point has multiple branches — see the switcher below.
        </p>
      )}
    </div>
  );
}