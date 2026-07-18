"use client";

import { motion } from "framer-motion";

const INSIGHTS = [
  "Every token gets its own unique positional vector — position 0 never looks like position 5.",
  "Nearby positions end up more similar to each other than distant ones — that's the fading pattern you see moving away from the diagonal.",
  "The diagonal is always brightest, because every position is perfectly identical to itself.",
];

export function PositionEducationCards() {
  return (
    <section className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-graphite-dim bg-white p-6 shadow-sm"
      >
        <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan">Key insight</p>
        <ul className="mt-4 space-y-3">
          {INSIGHTS.map((insight, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-graphite">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-cyan/10 font-mono text-[10px] font-bold text-signal-cyan">
                {i + 1}
              </span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-graphite-dim bg-white p-6 shadow-sm"
      >
        <p className="font-mono text-[11px] uppercase tracking-wider text-signal-violet">A simple analogy</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl">🎬</span>
          <p className="font-mono text-sm text-paper">Movie theater seats</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-graphite">
          Imagine two people hold the exact same ticket (the same word) — but one sits in seat 3, the other in seat
          30. The seat number doesn&apos;t change who they are, but it tells the theater exactly where each of
          them is relative to everyone else. Positional vectors work the same way: same word, different seat,
          different position in the sentence.
        </p>
      </motion.div>
    </section>
  );
}