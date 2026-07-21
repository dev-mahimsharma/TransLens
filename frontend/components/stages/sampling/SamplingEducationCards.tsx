"use client";

import { motion } from "framer-motion";
import { Thermometer, Filter, Target, Dice5 } from "lucide-react";

const CARDS = [
  {
    icon: Thermometer,
    title: "Temperature",
    body: "Divides logits before softmax. Below 1, the distribution sharpens toward confidence; above 1, it flattens, giving less-likely tokens a real shot.",
  },
  {
    icon: Filter,
    title: "Top-K filtering",
    body: "Restricts sampling to only the K highest-probability tokens, cutting off the long, unreliable tail of unlikely candidates entirely.",
  },
  {
    icon: Target,
    title: "Greedy decoding",
    body: "A temperature of exactly 0 collapses the distribution onto a single token — mathematically identical to always picking the top prediction.",
  },
  {
    icon: Dice5,
    title: "Randomness is the feature",
    body: "Re-sampling the same distribution can land on a different token on purpose — that variability is what makes generated text feel less robotic.",
  },
];

export function SamplingEducationCards() {
  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">The concepts behind the roll</h3>
      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-graphite-dim bg-white p-4"
          >
            <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-signal-violet/10 text-signal-violet">
              <c.icon className="h-4 w-4" />
            </span>
            <p className="font-display text-sm font-semibold text-paper">{c.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-graphite">{c.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}