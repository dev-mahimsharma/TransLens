"use client";

import { motion } from "framer-motion";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";

export function TokenizationMattersSection() {
  return (
    <section className="mt-4">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center text-base leading-relaxed text-graphite"
      >
        {STAGE_EXPLANATIONS.tokenization}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center"
      >
        <div className="rounded-xl border border-graphite-dim bg-void-raised px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">What you typed</p>
          <p className="mt-1 font-mono text-sm text-paper">&quot;strawberry&quot;</p>
        </div>
        <span className="font-mono text-graphite">→</span>
        <div className="rounded-xl border border-signal-cyan/30 bg-signal-cyan/5 px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-signal-cyan/80">What the model reads</p>
          <p className="mt-1 font-mono text-sm text-paper">&quot;straw&quot; · &quot;berry&quot;</p>
        </div>
      </motion.div>

      <p className="mx-auto mt-4 max-w-md text-center text-[13px] text-graphite">
        This is also why models are famously bad at counting letters — they never see individual letters, only these fragments.
      </p>
    </section>
  );
}