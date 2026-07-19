'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['bg-signal-cyan/10 text-signal-cyan', 'bg-emerald-100 text-emerald-800', 'bg-amber-100 text-amber-800', 'bg-rose-100 text-rose-800', 'bg-violet-100 text-violet-800', 'bg-blue-100 text-blue-800'];

// Illustrative subword splitter (not a real BPE model) — good enough to teach the concept.
function pseudoTokenize(text: string): string[] {
  const parts = text.match(/[A-Za-z]+|[0-9]+|[^\sA-Za-z0-9]+|\s+/g) ?? [];
  const tokens: string[] = [];
  for (const part of parts) {
    if (/\s+/.test(part)) continue;
    if (/^[A-Za-z]+$/.test(part) && part.length > 6) {
      const mid = Math.ceil(part.length / 2);
      tokens.push(part.slice(0, mid), '##' + part.slice(mid));
    } else {
      tokens.push(part);
    }
  }
  return tokens;
}

function fakeId(token: string): number {
  let h = 0;
  for (let i = 0; i < token.length; i++) h = (h * 31 + token.charCodeAt(i)) % 90000;
  return 1000 + h;
}

export function TokenizerPlayground() {
  const [text, setText] = useState('Unbelievable! Transformers changed everything.');
  const tokens = useMemo(() => pseudoTokenize(text), [text]);

  return (
    <div className="my-8 rounded-2xl border border-graphite-dim p-5 sm:p-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Type something…"
        className="w-full resize-none rounded-xl border border-graphite-dim bg-slate-50/60 p-3 font-body text-sm text-paper outline-none focus:border-signal-cyan focus:ring-2 focus:ring-signal-cyan/15"
      />
      <div className="mt-4 flex flex-wrap gap-1.5">
        <AnimatePresence mode="popLayout">
          {tokens.map((t, i) => (
            <motion.span
              key={t + i}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className={`rounded-md px-2 py-1 font-mono text-[12.5px] ${COLORS[i % COLORS.length]}`}
              title={`Token ID: ${fakeId(t)}`}
            >
              {t.replace('##', '')}
            </motion.span>
          ))}
        </AnimatePresence>
        {tokens.length === 0 && <p className="text-sm text-graphite/60">Start typing to see tokens appear…</p>}
      </div>
      <div className="mt-4 flex gap-6 border-t border-graphite-dim pt-3 text-[12.5px] text-graphite/80">
        <span><span className="font-semibold text-paper">{tokens.length}</span> tokens</span>
        <span><span className="font-semibold text-paper">{text.length}</span> characters</span>
        <span><span className="font-semibold text-paper">{text.length > 0 ? (text.length / Math.max(tokens.length, 1)).toFixed(1) : 0}</span> chars/token</span>
      </div>
    </div>
  );
}