"use client";

import { motion } from "framer-motion";
import { Puzzle, BookOpen, Layers, Flag } from "lucide-react";

const CARDS = [
  {
    icon: Puzzle,
    title: "Byte-Pair Encoding",
    body: "The tokenizer starts with individual characters and repeatedly merges the most frequent adjacent pair, building a vocabulary of reusable pieces.",
  },
  {
    icon: BookOpen,
    title: "Vocabulary",
    body: "A fixed table of every token the model knows — usually 30,000 to 100,000+ entries, each with its own integer id.",
  },
  {
    icon: Layers,
    title: "Subwords",
    body: "Common words are one token. Rare or made-up words get split into familiar fragments the model has seen before.",
  },
  {
    icon: Flag,
    title: "Special tokens",
    body: "Reserved ids like BOS/EOS mark where text starts and ends — structural signals, never ordinary text.",
  },
];

export function TokenEducationCards() {
  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">The concepts behind the split</h3>
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
            <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-signal-cyan/10 text-signal-cyan">
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