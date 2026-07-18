"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { STAGE_ORDER, STAGE_LABELS, type StageId } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

/**
 * The Signal Spine is TransLens's signature element (see design system
 * notes): a single glowing trace that physically connects every stage,
 * like an oscilloscope line or a circuit trace. It's not decorative --
 * it's the primary navigation for Mission Control, and it's what pulses
 * during a Time Travel recompute to show the ripple effect propagating
 * downstream.
 */
export function SignalSpine() {
  const activeStage = usePipelineStore((s) => s.activeStage);
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  const hasRun = usePipelineStore((s) => s.rootId !== null);
  const isLoading = usePipelineStore((s) => s.isLoading);
  const router = useRouter();

  const activeIndex = STAGE_ORDER.indexOf(activeStage);

  return (
    <div className="relative w-full py-16">
      {/* The trace itself */}
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-graphite-dim">
        <motion.div
          className={cn(
            "h-full bg-signal-cyan",
            isLoading && "animate-pulse-spine"
          )}
          initial={false}
          animate={{
            width: hasRun ? `${(activeIndex / (STAGE_ORDER.length - 1)) * 100}%` : "0%",
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 12px 1px var(--signal-cyan)" }}
        />
      </div>

      {/* Stage nodes */}
      <div className="relative flex items-center justify-between">
        {STAGE_ORDER.map((stage, i) => {
          const isActive = stage === activeStage;
          const isPast = hasRun && i <= activeIndex;
          const isDisabled = !hasRun && stage !== "prompt";

          return (
            <button
              key={stage}
              disabled={isDisabled}
              onClick={() => {
                if (stage === "prompt") {
                  router.push("/");
                } else {
                  setActiveStage(stage);
                }
              }}
              className={cn(
                "group flex flex-col items-center gap-3 transition-opacity",
                isDisabled && "cursor-not-allowed opacity-30"
              )}
            >
              <span
                className={cn(
                  "h-3 w-3 rounded-full border transition-all duration-300",
                  isActive
                    ? "border-signal-cyan bg-signal-cyan shadow-glow-cyan scale-125"
                    : isPast
                    ? "border-signal-cyan/60 bg-signal-cyan/60"
                    : "border-graphite-dim bg-void-raised group-hover:border-graphite"
                )}
              />
              <span
                className={cn(
                  "font-mono text-xs uppercase tracking-wider transition-colors",
                  isActive ? "text-paper" : "text-graphite"
                )}
              >
                {STAGE_LABELS[stage as StageId]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}