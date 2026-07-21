"use client";

import { motion } from "framer-motion";

export function FeedForwardMattersSection() {
  return (
    <section>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center text-base leading-relaxed text-graphite"
      >
        Self-attention just finished letting every token borrow information from every other token. The
        feed-forward network is the opposite: applied to each token completely independently, it&apos;s where the
        model does deeper, private processing on what attention just gathered.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center"
      >
        <div className="rounded-xl border border-graphite-dim bg-void-raised px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">Attention</p>
          <p className="mt-1 text-sm text-paper">Tokens talk to each other</p>
        </div>
        <span className="font-mono text-graphite">then</span>
        <div className="rounded-xl border border-signal-cyan/30 bg-signal-cyan/5 px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-signal-cyan/80">Feed-Forward</p>
          <p className="mt-1 text-sm text-paper">Each token thinks alone</p>
        </div>
      </motion.div>

      <p className="mx-auto mt-4 max-w-md text-center text-[13px] text-graphite">
        Despite feeling like a footnote, this layer holds roughly two-thirds of a Transformer&apos;s total parameters.
      </p>
    </section>
  );
}