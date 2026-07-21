"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export function LogitsMisconception() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto mt-16 max-w-2xl rounded-xl border border-ember/25 bg-ember/5 p-5"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-paper">
        <AlertTriangle className="h-4 w-4 text-ember" /> Common misconception
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-graphite">
        &quot;The model directly outputs the next word.&quot; It doesn&apos;t — it outputs a raw score for every
        possible token in the vocabulary, simultaneously. Turning that giant list of scores into one chosen word is
        a separate step: sampling, covered next.
      </p>
    </motion.section>
  );
}