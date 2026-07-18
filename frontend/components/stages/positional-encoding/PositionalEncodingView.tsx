"use client";

import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { PositionMattersSection } from "./PositionMattersSection";
import { InteractiveSentenceSection } from "./InteractiveSentenceSection";
import { PositionHeatmap } from "./PositionHeatmap";
import { PositionEducationCards } from "./PositionEducationCards";
import { PositionPlayground } from "./PositionPlayground";
import { PositionSummaryCard } from "./PositionSummaryCard";

/**
 * Full redesign per the conversation spec: 9 sections, visuals-first,
 * built to be understood in under 2 minutes without reading long text.
 * Keeps the existing white/minimal theme (bg-white cards, signal-cyan
 * accent, paper/graphite text tokens) exactly as already established
 * elsewhere in the app -- no new colors or layout system introduced.
 */
export function PositionalEncodingView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const { tokens, embeddings } = snapshot?.data ?? { tokens: [], embeddings: [] };

  if (!snapshot || tokens.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-graphite-dim">
        <p className="font-mono text-sm text-graphite">Need at least 2 tokens to visualize positional encoding</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="inline-block rounded-full bg-signal-cyan/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-signal-cyan">
          Step 3 of the Transformer Pipeline
        </span>
        <h2 className="mt-4 font-display text-4xl font-semibold text-paper">Positional Encoding</h2>
        <p className="mx-auto mt-3 max-w-md text-base text-graphite">
          How a model that reads everything at once still knows what came first.
        </p>
      </motion.div>

      <PositionMattersSection />

      <InteractiveSentenceSection tokens={tokens} embeddings={embeddings} />

      <section className="mt-16">
        <h3 className="text-center font-display text-2xl text-paper">Position similarity map</h3>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-graphite">
          Click any cell to lock in its exact similarity score. Brighter means more alike.
        </p>
        <div className="mt-8 flex justify-center">
          <PositionHeatmap labels={tokens.map((t) => t.text)} vectors={embeddings.map((e) => e.position_embedding)} />
        </div>
      </section>

      <PositionEducationCards />

      <PositionPlayground />

      <PositionSummaryCard />
    </div>
  );
}