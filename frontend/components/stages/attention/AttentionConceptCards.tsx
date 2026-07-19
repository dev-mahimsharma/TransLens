"use client";

import { motion } from "framer-motion";

const QKV = [
  { letter: "Q", name: "Query", body: "What this token is looking for. Think of it as the question a word asks: \"who else here is relevant to me?\"" },
  { letter: "K", name: "Key", body: "What this token has to offer. Every token advertises itself with a Key, so others can check if it matches what they're looking for." },
  { letter: "V", name: "Value", body: "The actual information passed along once a match is found. Query and Key decide HOW MUCH attention to pay; Value is WHAT gets passed." },
];

export function AttentionConceptCards() {
  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">The three pieces: Query, Key, Value</h3>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-graphite">
        Every token produces all three. Together they&apos;re what &ldquo;attention&rdquo; actually computes.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QKV.map((item, i) => (
          <motion.div
            key={item.letter}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-graphite-dim bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-signal-cyan/10 font-mono text-sm font-bold text-signal-cyan">
                {item.letter}
              </span>
              <p className="font-mono text-sm font-medium text-paper">{item.name}</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-graphite">{item.body}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-graphite-dim bg-white p-5 shadow-sm"
        >
          <p className="font-mono text-[11px] uppercase tracking-wider text-signal-violet">What&apos;s a Layer?</p>
          <p className="mt-2 text-sm leading-relaxed text-graphite">
            gpt2-small stacks 12 identical processing blocks, one after another. Each layer re-runs attention on the
            output of the layer before it — early layers tend to pick up on simple patterns (nearby words, grammar),
            later layers build more abstract relationships on top of that.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-graphite-dim bg-white p-5 shadow-sm"
        >
          <p className="font-mono text-[11px] uppercase tracking-wider text-signal-violet">What&apos;s a Head?</p>
          <p className="mt-2 text-sm leading-relaxed text-graphite">
            Within one layer, attention actually runs 12 times in parallel — 12 &ldquo;heads.&rdquo; Each head has its
            own Query/Key/Value, so it can specialize: one head might track grammatical subjects, another might
            track nearby words, another something else entirely. Their results get combined at the end of the layer.
          </p>
        </motion.div>
      </div>
    </section>
  );
}