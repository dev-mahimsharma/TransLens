"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InteractiveSentenceSectionProps {
  tokens: { text: string }[];
  embeddings: { token_embedding: number[]; position_embedding: number[]; combined: number[] }[];
}

const LABEL_COLORS: Record<string, string> = {
  cyan: "var(--signal-cyan)",
  violet: "var(--signal-violet)",
  paper: "var(--paper)",
};

export function InteractiveSentenceSection({ tokens, embeddings }: InteractiveSentenceSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex ?? 0;

  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">Your sentence, position by position</h3>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-graphite">
        Hover any token to see its position id and positional vector. Want to try a different sentence? Scroll down to the Playground.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {tokens.map((t, i) => (
          <motion.button
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            whileHover={{ y: -3 }}
            className={`rounded-xl border px-4 py-2.5 text-left shadow-sm transition-colors ${
              hoveredIndex === i ? "border-signal-cyan bg-signal-cyan/5" : "border-graphite-dim bg-white"
            }`}
          >
            <span className="block font-mono text-sm text-paper">{t.text.trim() || "␣"}</span>
            <span className="mt-0.5 block font-mono text-[10px] text-graphite">position {i}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-graphite">
          How &ldquo;{tokens[activeIndex]?.text.trim() || "␣"}&rdquo; becomes its final embedding
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          >
            <CompositionBox label="Word Embedding" sublabel="what the word means" colorKey="cyan" />
            <PlusSign />
            <CompositionBox label="Position Vector" sublabel={`where it sits (pos ${activeIndex})`} colorKey="violet" />
            <ArrowSign />
            <CompositionBox label="Final Embedding" sublabel="meaning + position, combined" colorKey="paper" emphasized />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function CompositionBox({
  label,
  sublabel,
  colorKey,
  emphasized,
}: {
  label: string;
  sublabel: string;
  colorKey: string;
  emphasized?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-40 rounded-xl border p-4 text-center shadow-sm ${
        emphasized ? "border-signal-cyan bg-signal-cyan/5" : "border-graphite-dim bg-white"
      }`}
    >
      <p className="font-mono text-xs font-medium" style={{ color: LABEL_COLORS[colorKey] }}>
        {label}
      </p>
      <p className="mt-1 text-[11px] text-graphite">{sublabel}</p>
    </motion.div>
  );
}

function PlusSign() {
  return <span className="font-mono text-xl text-graphite">+</span>;
}

function ArrowSign() {
  return <span className="font-mono text-xl text-graphite">→</span>;
}