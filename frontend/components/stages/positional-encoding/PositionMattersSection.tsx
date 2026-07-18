"use client";

import { motion } from "framer-motion";

const WITHOUT_A = ["Dog", "bites", "man"];
const WITHOUT_B = ["Man", "bites", "dog"];

export function PositionMattersSection() {
  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">Why position matters</h3>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-graphite">
        The exact same words, rearranged, mean something completely different — the model needs a way to know which word came first.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-graphite-dim bg-white p-6 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ember">Without positional encoding</p>
          <div className="mt-4 space-y-3">
            {[WITHOUT_A, WITHOUT_B].map((sentence, row) => (
              <div key={row} className="flex justify-center gap-2">
                {sentence.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (row * 3 + i) * 0.08 }}
                    className="rounded-full border border-graphite-dim bg-white px-3 py-1.5 font-mono text-sm text-paper shadow-sm"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-graphite">
            Without position information, both sentences look like the exact same <em>set</em> of words to the model — it can&apos;t tell them apart.
          </p>
        </div>

        <div className="rounded-2xl border border-graphite-dim bg-white p-6 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan">With positional encoding</p>
          <div className="mt-4 flex justify-center gap-2">
            {WITHOUT_A.map((word, i) => (
              <motion.div key={i} className="flex flex-col items-center gap-1.5">
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="rounded-full border border-signal-cyan/40 bg-signal-cyan/5 px-3 py-1.5 font-mono text-sm text-paper shadow-sm"
                >
                  {word}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 + 0.3, type: "spring" }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-signal-cyan font-mono text-[10px] font-bold text-white"
                >
                  {i}
                </motion.span>
              </motion.div>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-graphite">
            Now every token carries a position id. &ldquo;Dog(0) bites(1) man(2)&rdquo; is clearly distinct from &ldquo;man(0) bites(1) dog(2)&rdquo;.
          </p>
        </div>
      </div>
    </section>
  );
}