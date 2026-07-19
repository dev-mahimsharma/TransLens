'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const TOKENS = ['The', 'trophy', "didn't", 'fit', 'in', 'the', 'suitcase', 'because', 'it', 'was', 'too', 'big'];

// Illustrative fixed attention weights (not a real model) — chosen so "it"
// visibly attends most to "trophy", the classic coreference-resolution example.
const WEIGHTS: Record<number, number[]> = {
  8: [0.02, 0.46, 0.02, 0.05, 0.02, 0.02, 0.22, 0.03, 0.05, 0.03, 0.04, 0.04],
};
function fallback(n: number, focus: number) {
  return Array.from({ length: n }, (_, i) => (i === focus ? 0.4 : Math.max(0.02, 0.6 / n - Math.abs(i - focus) * 0.03)));
}

export function AttentionHeatmap() {
  const [selected, setSelected] = useState(8); // "it"
  const weights = WEIGHTS[selected] ?? fallback(TOKENS.length, selected);
  const max = Math.max(...weights);

  return (
    <div className="w-full max-w-2xl">
      <p className="mb-3 text-[12.5px] text-graphite">Click any token — the highlight shows what <span className="font-semibold text-paper">that token</span> pays attention to.</p>
      <div className="flex flex-wrap gap-1.5">
        {TOKENS.map((t, i) => {
          const w = weights[i] / max;
          const isSelected = i === selected;
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="rounded-lg border px-2.5 py-1.5 font-mono text-[13px] transition-all"
              style={{
                borderColor: isSelected ? '#2563EB' : '#E5E7EB',
                background: isSelected ? '#2563EB' : `rgba(37,99,235,${0.08 + w * 0.5})`,
                color: isSelected ? '#fff' : '#111827',
                fontWeight: isSelected ? 700 : 500,
              }}
            >
              {t}
            </button>
          );
        })}
      </div>
      <motion.div key={selected} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-1">
        {TOKENS.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 shrink-0 truncate text-right font-mono text-[10.5px] text-graphite">{t}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-void-raised">
              <motion.div
                className="h-full rounded-full bg-signal-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${(weights[i] / max) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="w-9 shrink-0 font-mono text-[10px] text-graphite/70">{(weights[i] * 100).toFixed(0)}%</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}