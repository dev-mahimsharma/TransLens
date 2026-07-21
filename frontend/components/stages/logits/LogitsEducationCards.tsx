"use client";

import { motion } from "framer-motion";
import { Layers, BookOpen, Repeat, ArrowUpDown } from "lucide-react";

const CARDS = [
  {
    icon: Layers,
    title: "The language modeling head",
    body: "One learned linear layer projects the final hidden state up to a vector as long as the entire vocabulary — one score per possible next token.",
  },
  {
    icon: BookOpen,
    title: "Vocabulary-sized output",
    body: "For GPT-2, that's 50,257 scores computed for every single token position, on every single forward pass.",
  },
  {
    icon: Repeat,
    title: "Weight tying",
    body: "Many models reuse the same matrix from the input embeddings (transposed) as this output layer, saving a meaningful number of parameters.",
  },
  {
    icon: ArrowUpDown,
    title: "Ranking, not probability",
    body: "A higher logit always means a more preferred token — but the raw numbers don't sum to anything meaningful on their own.",
  },
];

export function LogitsEducationCards() {
  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">The concepts behind the scores</h3>
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