"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";

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
  // Assuming the predictions are sorted descending by logit score.
  const topLogitId = predictions[0]?.token_id;

  return (
    <section className="py-10">
      <div className="mb-12 flex flex-col items-center text-center">
        <h2 className="font-display text-3xl text-paper">Logits</h2>
        <p className="mt-4 max-w-2xl text-base text-graphite">
          {STAGE_EXPLANATIONS.logits}
        </p>
        
        {/* Info Card: What are Logits? */}
        <div className="mt-8 w-full max-w-2xl rounded-xl border border-graphite-dim bg-void-raised p-5 text-left shadow-[0_4px_24px_rgba(0,0,0,0.1)]">
          <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan mb-2">What are Logits?</p>
          <p className="text-sm leading-relaxed text-graphite">
            Logits are the neural network's raw, unnormalized confidence scores. They are <strong>not probabilities</strong>, meaning they can be massive numbers or even negative. In the next step, the Softmax function will convert these raw scores into clean, usable probabilities.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-2.5">
        {predictions.map((pred) => {
          const zeroPos = (-minLogit / range) * 100;
          const barPos = (pred.logit / range) * 100;
          const isPositive = pred.logit >= 0;
          const isTop = pred.token_id === topLogitId;

          return (
            <div key={pred.token_id} className="flex items-center gap-4">
              <div className="w-24 shrink-0 text-right flex flex-col items-end">
                <span className={`block font-mono text-sm truncate w-full ${isTop ? "text-signal-cyan font-semibold" : "text-paper"}`}>
                  {pred.token_text.trim() || "␣"}
                </span>
                {isTop && (
                  <span className="mt-0.5 inline-block rounded bg-signal-cyan/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-signal-cyan">
                    Top
                  </span>
                )}
              </div>
              
              <div className="relative h-5 flex-1 rounded bg-void-raised">
                <div
                  className="absolute top-0 z-10 h-full w-px bg-graphite/40"
                  style={{ left: `${zeroPos}%` }}
                />
                <motion.div
                  className={`absolute top-0 h-full rounded-sm ${
                    isTop ? "bg-signal-cyan" : isPositive ? "bg-signal-cyan/60" : "bg-ember/70"
                  }`}
                  initial={false}
                  animate={{
                    left: isPositive ? `${zeroPos}%` : `${zeroPos + barPos}%`,
                    width: `${Math.abs(barPos)}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className={`w-16 shrink-0 font-mono text-xs ${isTop ? "text-signal-cyan font-medium" : "text-graphite"}`}>
                {pred.logit.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Comparison Card */}
      <div className="mx-auto mt-14 max-w-3xl rounded-xl border border-graphite-dim bg-void-raised p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 border-b border-graphite-dim pb-2 font-mono text-[11px] uppercase tracking-wider text-graphite">
              Logits (Raw Scores)
            </p>
            <ul className="space-y-2 text-sm text-graphite">
              <li>• Raw outputs directly from the model</li>
              <li>• Can be negative or wildly large</li>
              <li>• Do not sum to 1</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 border-b border-graphite-dim pb-2 font-mono text-[11px] uppercase tracking-wider text-signal-cyan">
              Probabilities (Sampling)
            </p>
            <ul className="space-y-2 text-sm text-graphite">
              <li>• Normalized, readable percentages</li>
              <li>• Strictly bounded between 0 and 1</li>
              <li>• Always perfectly sum to 1 (100%)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transition Flow Diagram */}
      <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-graphite-dim bg-void-raised px-4 py-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-6">
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-graphite">Stage 1</span>
            <span className="mt-1 font-mono text-sm text-paper">Raw Logits</span>
          </div>
          <span className="hidden text-graphite sm:block">→</span>
          <span className="text-graphite sm:hidden">↓</span>
          <div className="flex flex-col items-center rounded-lg border border-signal-cyan/30 bg-signal-cyan/5 px-4 py-2">
            <span className="font-mono text-[10px] uppercase text-signal-cyan">Math</span>
            <span className="mt-1 font-mono text-sm text-signal-cyan">Softmax Function</span>
          </div>
          <span className="hidden text-graphite sm:block">→</span>
          <span className="text-graphite sm:hidden">↓</span>
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] text-graphite">Stage 2</span>
            <span className="mt-1 font-mono text-sm text-paper">Probabilities</span>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <button
          onClick={() => setActiveStage("feed_forward")}
          className="rounded-full border border-graphite-dim px-5 py-2 font-mono text-xs uppercase tracking-wider text-graphite transition-colors hover:border-graphite hover:text-paper"
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
