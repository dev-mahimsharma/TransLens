"use client";

import { motion } from "framer-motion";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";

export function SamplingMattersSection() {
  return (
    <section>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center text-base leading-relaxed text-graphite"
      >
        {STAGE_EXPLANATIONS.sampling}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center"
      >
        <div className="rounded-xl border border-graphite-dim bg-void-raised px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">Greedy decoding</p>
          <p className="mt-1 text-sm text-paper">Always the #1 pick</p>
        </div>
        <span className="font-mono text-graphite">vs</span>
        <div className="rounded-xl border border-signal-violet/30 bg-signal-violet/5 px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-signal-violet/80">Sampling</p>
          <p className="mt-1 text-sm text-paper">Rolls the dice on the odds</p>
        </div>
      </motion.div>

      <p className="mx-auto mt-4 max-w-md text-center text-[13px] text-graphite">
        Same prompt, same probabilities — different roll of the dice can still land on a different word. That&apos;s
        by design, not a bug.
      </p>
    </section>
  );
}