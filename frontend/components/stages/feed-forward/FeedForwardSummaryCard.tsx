"use client";

import { motion } from "framer-motion";

export function FeedForwardSummaryCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto mt-16 max-w-2xl rounded-2xl border border-graphite-dim bg-void-raised p-6 text-center"
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan">Recap</p>
      <p className="mt-3 text-[15px] leading-relaxed text-graphite">
        Each token&apos;s vector, now enriched by attention, gets expanded, pushed through a nonlinear activation,
        and projected back down — independently, with no cross-token communication. This repeats for every layer
        in the stack.
      </p>
      <p className="mt-4 font-mono text-xs text-graphite">
        Up next: turning the final layer&apos;s output into scores for every possible next token →
      </p>
    </motion.section>
  );
}