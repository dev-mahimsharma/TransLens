"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";

/**
 * Split out from Sampling deliberately: logits and probabilities are
 * conceptually different things (raw unnormalized scores vs. a valid
 * distribution), and collapsing them into one stage was hiding that
 * distinction. This view shows raw logit values -- including negative
 * ones -- with no softmax applied, so the jump to probabilities in the
 * next stage actually reads as a transformation rather than "just how
 * predictions look".
 */
export function LogitsView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);

  const predictions = snapshot?.data.top_k_predictions ?? [];

  const { minLogit, maxLogit } = useMemo(() => {
    const values = predictions.map((p) => p.logit);
    return { minLogit: Math.min(...values, 0), maxLogit: Math.max(...values, 0) };
  }, [predictions]);

  if (!snapshot || predictions.length === 0) return null;

  const range = maxLogit - minLogit || 1;

  return (
    <section className="py-10">
      <div className="mb-8">
        <h2 className="font-display text-2xl text-paper">Logits</h2>
        <p className="mt-2 max-w-lg text-sm text-graphite">
          {STAGE_EXPLANATIONS.logits}
        </p>
      </div>

      <div className="max-w-xl space-y-2.5">
        {predictions.map((pred) => {
          // Bars can extend either direction from zero, since logits can
          // be negative -- a zero-anchored bar makes that visible instead
          // of hiding negatives behind a always-positive-looking bar.
          const zeroPos = (-minLogit / range) * 100;
          const barPos = (pred.logit / range) * 100;
          const isPositive = pred.logit >= 0;

          return (
            <div key={pred.token_id} className="flex items-center gap-3">
              <span className="w-20 shrink-0 truncate text-right font-mono text-sm text-paper">
                {pred.token_text.trim() || "␣"}
              </span>
              <div className="relative h-4 flex-1 rounded bg-void-raised">
                <div
                  className="absolute top-0 h-full w-px bg-graphite"
                  style={{ left: `${zeroPos}%` }}
                />
                <motion.div
                  className={`absolute top-0 h-full rounded-sm ${
                    isPositive ? "bg-signal-cyan" : "bg-ember"
                  }`}
                  initial={false}
                  animate={{
                    left: isPositive ? `${zeroPos}%` : `${zeroPos + barPos}%`,
                    width: `${Math.abs(barPos)}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="w-16 shrink-0 font-mono text-xs text-graphite">
                {pred.logit.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-6 max-w-xl font-mono text-[11px] text-graphite">
        These are raw scores, not probabilities — notice they don&apos;t sum to
        1 and can be negative. Softmax fixes that, next.
      </p>

      <div className="mt-12 flex justify-between">
        <button
          onClick={() => setActiveStage("feed_forward")}
          className="rounded-full border border-graphite-dim px-5 py-2 font-mono text-xs uppercase tracking-wider text-graphite hover:text-paper"
        >
          ← Back to Feed-Forward Network
        </button>
        <button
          onClick={() => setActiveStage("sampling")}
          className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          Next: Sampling →
        </button>
      </div>
    </section>
  );
}
