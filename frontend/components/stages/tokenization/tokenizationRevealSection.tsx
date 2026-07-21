"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TokenInfo } from "@/lib/engine/types";

export function TokenizationRevealSection({ tokens }: { tokens: TokenInfo[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">Your exact prompt, sliced apart</h3>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-graphite">
        Click any piece to see exactly what the tokenizer produced for it.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {tokens.map((token, i) => {
          const isSelected = selected === token.index;
          return (
            <motion.button
              key={token.index}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(isSelected ? null : token.index)}
              whileHover={{ y: -2 }}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "border-signal-cyan bg-signal-cyan/10 shadow-glow-cyan"
                  : "border-graphite-dim bg-void-raised hover:border-graphite"
              }`}
            >
              <span className="block font-mono text-sm text-paper">{token.text || "\u00A0"}</span>
              <span className="mt-1 block font-mono text-xs text-graphite">id {token.id}</span>
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
            className="mx-auto mt-6 max-w-2xl overflow-hidden rounded-xl border border-graphite-dim bg-void-raised p-5"
          >
            <TokenDetail token={tokens.find((t) => t.index === selected)!} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function TokenDetail({ token }: { token: TokenInfo }) {
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
          <dt className="font-mono text-[11px] uppercase tracking-wider text-graphite">{label}</dt>
          <dd className="mt-1 font-mono text-sm text-signal-cyan">{value}</dd>
        </div>
      ))}
    </dl>
  );
}