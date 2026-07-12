"use client";

import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { cn } from "@/lib/utils";

/**
 * X-Ray Mode's depth control. Deliberately two options for v3 (not the
 * four originally planned) -- see lib/content/explanations.ts for the
 * reasoning. Every stage view reads `explanationDepth` from the store to
 * pick which copy to show, so this one toggle affects the whole pipeline
 * at once rather than needing to be set per-stage.
 */
export function DepthSelector() {
  const depth = usePipelineStore((s) => s.explanationDepth);
  const setDepth = usePipelineStore((s) => s.setExplanationDepth);

  return (
    <div className="flex items-center rounded-full border border-graphite-dim bg-void-raised p-0.5">
      {(["beginner", "developer"] as const).map((level) => (
        <button
          key={level}
          onClick={() => setDepth(level)}
          className={cn(
            "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
            depth === level ? "bg-signal-cyan text-void" : "text-graphite hover:text-paper"
          )}
        >
          {level}
        </button>
      ))}
    </div>
  );
}