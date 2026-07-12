"use client";

import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { cn } from "@/lib/utils";

/**
 * A "branch" here is just a leaf snapshot -- the tip of one path through
 * the tree from the root. Listing every leaf and letting you jump to any
 * of them IS branch switching; there's no separate "branch" object to
 * manage, which keeps this simple even though the underlying structure
 * (a tree of snapshots) is doing real work.
 *
 * Each branch can also be set as the explicit Before/After compare
 * target -- this is what makes "compare experiments side by side"
 * concrete: pick branch B while sitting on branch A, and every stage's
 * ghost overlay now shows B's values behind A's.
 */
export function BranchSwitcher() {
  const leaves = usePipelineStore((s) => s.leaves());
  const activeSnapshotId = usePipelineStore((s) => s.activeSnapshotId);
  const compareSnapshotId = usePipelineStore((s) => s.compareSnapshotId);
  const jumpToSnapshot = usePipelineStore((s) => s.jumpToSnapshot);
  const setCompareSnapshot = usePipelineStore((s) => s.setCompareSnapshot);

  // Only one branch exists (no forking has happened yet) -- nothing to switch.
  if (leaves.length <= 1) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-graphite">
        Branches — {leaves.length} experiments
      </p>
      <div className="flex flex-wrap gap-3">
        {leaves.map((leaf, i) => {
          const isActive = leaf.id === activeSnapshotId;
          const isCompareTarget = leaf.id === compareSnapshotId;
          return (
            <div
              key={leaf.id}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2",
                isActive ? "border-signal-cyan bg-signal-cyan/10" : "border-graphite-dim bg-void-raised"
              )}
            >
              <button
                onClick={() => jumpToSnapshot(leaf.id)}
                className="text-left"
                title={leaf.origin?.description ?? "Original run"}
              >
                <span className="block font-mono text-xs text-paper">Branch {i + 1}</span>
                <span className="block max-w-[180px] truncate font-mono text-[10px] text-graphite">
                  {leaf.origin?.description ?? "Original — no edits"}
                </span>
              </button>
              {!isActive && (
                <button
                  onClick={() => setCompareSnapshot(isCompareTarget ? null : leaf.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
                    isCompareTarget
                      ? "border-signal-violet text-signal-violet"
                      : "border-graphite-dim text-graphite hover:text-paper"
                  )}
                >
                  {isCompareTarget ? "Comparing" : "Compare"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}