"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export function FeedForwardMisconception() {
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
        &quot;The feed-forward network is a minor, optional add-on to attention.&quot; It&apos;s the opposite — remove
        it and the model loses most of its capacity to transform and refine what attention gathered. Attention
        decides what to look at; the FFN does much of the actual computation, and holds most of the weights doing
        it.
      </p>
    </motion.section>
  );
}