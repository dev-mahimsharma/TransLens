"use client";

import { motion } from "framer-motion";

const INSIGHTS = [
  "Attention is computed independently in every head — 12 heads per layer, 12 layers, each potentially tracking something different.",
  "Causal masking means a token can only attend to itself and tokens before it — never tokens that come later.",
  "The attention weights always sum to 100% for a given query — it's a genuine probability distribution over 'who to listen to.'",
];

export function AttentionInsightCards() {
  return (
    <section className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-graphite-dim bg-white p-6 shadow-sm"
      >
        <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan">Key insight</p>
        <ul className="mt-4 space-y-3">
          {INSIGHTS.map((insight, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-graphite">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-cyan/10 font-mono text-[10px] font-bold text-signal-cyan">
                {i + 1}
              </span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-graphite-dim bg-white p-6 shadow-sm"
      >
        <p className="font-mono text-[11px] uppercase tracking-wider text-signal-violet">A simple analogy</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl">🔦</span>
          <p className="font-mono text-sm text-paper">A spotlight, not a floodlight</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-graphite">
          Imagine reading a sentence with a spotlight instead of a floodlight — instead of seeing every word equally,
          you shine more light on the words that actually help you understand the one you&apos;re currently reading,
          and less on the ones that don&apos;t. That variable brightness, recalculated for every single word, is
          exactly what an attention weight is.
        </p>
      </motion.div>
    </section>
  );
}