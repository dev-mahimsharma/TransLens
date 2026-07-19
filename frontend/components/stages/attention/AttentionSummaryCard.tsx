"use client";

import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";

const TAKEAWAYS = [
  "Every token produces a Query, a Key, and a Value.",
  "Attention weight = how well one token's Query matches another's Key, scaled and turned into a probability.",
  "12 heads run in parallel per layer, each free to specialize in different relationships.",
  "12 layers stack this process, building increasingly abstract context as information flows forward.",
];

export function AttentionSummaryCard() {
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto mt-16 max-w-xl rounded-2xl border border-graphite-dim bg-white p-6 text-center shadow-sm"
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan">What you learned</p>
      <ul className="mx-auto mt-4 max-w-sm space-y-2.5 text-left">
        {TAKEAWAYS.map((t, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-graphite">
            <span className="text-signal-cyan">✓</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setActiveStage("feed_forward")}
        className="mt-6 rounded-xl bg-signal-cyan px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
      >
        Continue to Feed-Forward Network →
      </button>
    </motion.section>
  );
}