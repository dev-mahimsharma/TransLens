'use client';

import { motion } from 'framer-motion';

export function ClosingCTA() {
  return (
    <section className="mx-auto mb-28 mt-28 max-w-2xl px-6 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
          The black box, opened.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-graphite">
          You already scrolled this far. You clearly want to know how it actually works — so go find out.
        </p>
        <a
          href="#prompt-input"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-signal-cyan px-7 py-3.5 text-sm font-semibold text-white shadow-glow-cyan transition-all hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Type your first prompt
        </a>
      </motion.div>
    </section>
  );
}