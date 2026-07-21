"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORD = "unbelievable";
const MERGE_STEPS: string[][] = [
  ["u", "n", "b", "e", "l", "i", "e", "v", "a", "b", "l", "e"],
  ["un", "b", "e", "l", "i", "e", "v", "a", "b", "l", "e"],
  ["un", "be", "l", "i", "e", "v", "a", "b", "l", "e"],
  ["un", "be", "li", "e", "v", "a", "b", "l", "e"],
  ["un", "be", "liev", "a", "b", "l", "e"],
  ["un", "believ", "able"],
  ["un", "believable"],
];

export function TokenMergePlayground() {
  const [step, setStep] = useState(0);

  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">Watch a word get built, piece by piece</h3>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-graphite">
        An illustrative example of how BPE merges characters into subwords for &quot;{WORD}&quot; — step {step + 1} of {MERGE_STEPS.length}.
      </p>

      <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {MERGE_STEPS[step].map((piece, i) => (
            <motion.span
              key={piece + i}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="rounded-lg border border-graphite-dim bg-void-raised px-3 py-1.5 font-mono text-sm text-paper"
            >
              {piece}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full border border-graphite-dim px-4 py-1.5 font-mono text-xs text-graphite transition-colors hover:border-graphite hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Prev merge
        </button>
        <button
          onClick={() => setStep((s) => Math.min(MERGE_STEPS.length - 1, s + 1))}
          disabled={step === MERGE_STEPS.length - 1}
          className="rounded-full bg-signal-cyan px-4 py-1.5 font-mono text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next merge →
        </button>
      </div>
    </section>
  );
}