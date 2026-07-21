"use client";

import { motion } from "framer-motion";

export function LogitsSummaryCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto mt-16 max-w-2xl rounded-2xl border border-graphite-dim bg-void-raised p-6 text-center"
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan">Recap</p>
      <p className="mt-3 text-[15px] leading-relaxed text-graphite">
        The final hidden state was projected into one raw score per vocabulary token. Higher always beats lower for
        ranking — but these numbers aren&apos;t probabilities yet, and can&apos;t be sampled from directly.
      </p>
      <p className="mt-4 font-mono text-xs text-graphite">
        Up next: softmax turns these into a real probability distribution, then a token gets chosen →
      </p>
    </motion.section>
  );
}