"use client";

import { motion } from "framer-motion";

const SENTENCE = ["The", "bank", "by", "the", "river"];

export function AttentionMattersSection() {
  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">Why attention matters</h3>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-graphite">
        The word &ldquo;bank&rdquo; alone is ambiguous — a riverbank, or a place with money? Context decides. Attention is how the model gathers that context.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-graphite-dim bg-white p-6 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ember">Without attention</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SENTENCE.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-full border px-3 py-1.5 font-mono text-sm shadow-sm ${
                  word === "bank" ? "border-ember/40 bg-ember/5 text-ember" : "border-graphite-dim bg-white text-paper"
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-graphite">
            Each word is processed completely on its own — &ldquo;bank&rdquo; has no way to know &ldquo;river&rdquo; is anywhere nearby.
          </p>
        </div>

        <div className="rounded-2xl border border-graphite-dim bg-white p-6 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan">With attention</p>
          <div className="relative mt-4 flex flex-wrap justify-center gap-2">
            {SENTENCE.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-full border px-3 py-1.5 font-mono text-sm shadow-sm ${
                  word === "bank"
                    ? "border-signal-cyan bg-signal-cyan/10 text-signal-cyan"
                    : word === "river"
                    ? "border-signal-cyan/40 bg-signal-cyan/5 text-paper"
                    : "border-graphite-dim bg-white text-paper"
                }`}
              >
                {word}
              </motion.span>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-graphite">
            Now &ldquo;bank&rdquo; can look at &ldquo;river&rdquo; and pull in that context — the model leans toward the riverbank meaning.
          </p>
        </div>
      </div>
    </section>
  );
}