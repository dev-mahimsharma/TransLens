"use client";

import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";

const TAKEAWAYS = [
  "Transformers process all tokens at once, in parallel — with no built-in sense of order.",
  "Positional encoding gives every token a unique vector marking its place in the sequence.",
  "That positional vector gets added directly to the word's own embedding.",
  "This is what lets the model tell \"dog bites man\" apart from \"man bites dog.\"",
];

export function PositionSummaryCard() {
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
        onClick={() => setActiveStage("attention")}
        className="mt-6 rounded-xl bg-signal-cyan px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
      >
        Continue to Self-Attention →
      </button>
    </motion.section>
  );
}