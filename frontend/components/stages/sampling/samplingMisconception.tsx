"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export function SamplingMisconception() {
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
        &quot;Higher temperature makes the model smarter or more creative, in a good way.&quot; It just increases
        randomness — past a certain point, higher temperature reliably produces less coherent, more error-prone
        text, not deeper insight.
      </p>
    </motion.section>
  );
}