"use client";

import { motion } from "framer-motion";

export function SamplingSummaryCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto mt-16 max-w-2xl rounded-2xl border border-graphite-dim bg-void-raised p-6 text-center"
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-signal-violet">Recap</p>
      <p className="mt-3 text-[15px] leading-relaxed text-graphite">
        Temperature reshapes the distribution, top-k trims the candidate pool, and one weighted roll of the dice
        picks the actual next token. That chosen token gets appended to the prompt, and the entire pipeline runs
        again — that&apos;s how a full reply gets built, one token at a time.
      </p>
      <p className="mt-4 font-mono text-xs text-graphite">Try different settings above, or start a new prompt below.</p>
    </motion.section>
  );
}