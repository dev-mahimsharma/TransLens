"use client";

import { motion } from "framer-motion";

export function TokenSummaryCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto mt-16 max-w-2xl rounded-2xl border border-graphite-dim bg-void-raised p-6 text-center"
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan">Recap</p>
      <p className="mt-3 text-[15px] leading-relaxed text-graphite">
        Your prompt was split into subword pieces using Byte-Pair Encoding, and each piece was mapped to a fixed
        integer id from the model&apos;s vocabulary. Nothing about meaning happened yet — that&apos;s next.
      </p>
      <p className="mt-4 font-mono text-xs text-graphite">Up next: turning these ids into vectors →</p>
    </motion.section>
  );
}