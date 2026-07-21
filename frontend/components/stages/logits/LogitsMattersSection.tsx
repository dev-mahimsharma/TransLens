"use client";

import { motion } from "framer-motion";

export function LogitsMattersSection() {
  return (
    <section>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center text-base leading-relaxed text-graphite"
      >
        After the final Transformer layer, the model has a rich vector describing everything it currently
        understands about your prompt — but that&apos;s just numbers, not a word. One more linear layer converts it
        into a raw score for literally every token in the vocabulary: the logits below.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center"
      >
        <div className="rounded-xl border border-graphite-dim bg-void-raised px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">Judges&apos; raw points</p>
          <p className="mt-1 font-mono text-sm text-paper">8.2 · 6.9 · −3.8</p>
        </div>
        <span className="font-mono text-graphite">vs</span>
        <div className="rounded-xl border border-signal-cyan/30 bg-signal-cyan/5 px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-signal-cyan/80">Percentage of the vote</p>
          <p className="mt-1 font-mono text-sm text-paper">71% · 21% · 0.1%</p>
        </div>
      </motion.div>

      <p className="mx-auto mt-4 max-w-md text-center text-[13px] text-graphite">
        Logits are the raw points — useful for ranking, but not yet something you can sample from as a clean
        probability.
      </p>
    </section>
  );
}