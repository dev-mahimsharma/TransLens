"use client";

import { motion } from "framer-motion";
import { Layers, Zap, UserCheck, Database } from "lucide-react";

const CARDS = [
  {
    icon: Layers,
    title: "Two linear layers",
    body: "The vector is expanded (often 4x wider), then projected back down to its original size — giving the network room to combine features in complex ways.",
  },
  {
    icon: Zap,
    title: "GELU activation",
    body: "A nonlinear function sits between the two layers. Without it, stacking linear layers would collapse into one big linear transform, no matter how deep.",
  },
  {
    icon: UserCheck,
    title: "Per-token, not cross-token",
    body: "Unlike attention, the exact same weights are applied to every token position independently — no information crosses between tokens here.",
  },
  {
    icon: Database,
    title: "Most of the parameters",
    body: 'Feed-forward layers typically hold around two-thirds of a Transformer\'s total weights — a lot of what a model "knows" lives here.',
  },
];

export function FeedForwardEducationCards() {
  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">The concepts behind the layer</h3>
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