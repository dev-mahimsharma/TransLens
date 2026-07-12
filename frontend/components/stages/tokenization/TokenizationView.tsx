"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";

/**
 * Tokenization deep-dive. Each token is a card showing the raw text, its
 * numeric id, and — on hover/select — how the tokenizer actually split
 * this piece of text (useful for showing subword splits, leading spaces
 * encoded as "Ġ", etc, which is often the first "oh, THAT'S how it works"
 * moment for a new user).
 *
 * Tokenization itself isn't editable in v1 (swapping a token changes the
 * prompt, which is really a new run, not a Time Travel edit) -- so this
 * stage's job is to teach clearly and hand off cleanly to Embeddings.
 */
export function TokenizationView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  const depth = usePipelineStore((s) => s.explanationDepth);
  const [selected, setSelected] = useState<number | null>(null);

  if (!snapshot) return null;
  const { tokens } = snapshot.data;

  return (
    <section className="py-10">
      <div className="mb-8">
        <h2 className="font-display text-2xl text-paper">Tokenization</h2>
        <p className="mt-2 max-w-lg text-sm text-graphite">
          {STAGE_EXPLANATIONS.tokenization[depth]}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tokens.map((token) => {
          const isSelected = selected === token.index;
          return (
            <motion.button
              key={token.index}
              layout
              onClick={() => setSelected(isSelected ? null : token.index)}
              whileHover={{ y: -2 }}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "border-signal-cyan bg-signal-cyan/10 shadow-glow-cyan"
                  : "border-graphite-dim bg-void-raised hover:border-graphite"
              }`}
            >
              <span className="block font-mono text-sm text-paper">
                {token.text || "\u00A0"}
              </span>
              <span className="mt-1 block font-mono text-xs text-graphite">
                id {token.id}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden rounded-xl border border-graphite-dim bg-void-raised p-5"
          >
            <TokenDetail index={selected} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex justify-end">
        <button
          onClick={() => setActiveStage("embeddings")}
          className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90"
        >
          Next: Embeddings →
        </button>
      </div>
    </section>
  );
}

function TokenDetail({ index }: { index: number }) {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  if (!snapshot) return null;
  const token = snapshot.data.tokens[index];

  const rows: [string, string][] = [
    ["Position in sequence", String(token.index)],
    ["Token id", String(token.id)],
    ["Raw tokenizer output", token.raw],
    ["Decoded text", token.text || "(whitespace)"],
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-graphite">
            {label}
          </dt>
          <dd className="mt-1 font-mono text-sm text-signal-cyan">{value}</dd>
        </div>
      ))}
    </dl>
  );
}