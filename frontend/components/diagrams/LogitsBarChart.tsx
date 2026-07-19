'use client';
import { motion } from 'framer-motion';

const CANDIDATES = [
  { token: 'mat', logit: 8.2 },
  { token: 'floor', logit: 6.9 },
  { token: 'chair', logit: 4.1 },
  { token: 'moon', logit: -1.5 },
  { token: 'banana', logit: -3.8 },
];

export function LogitsBarChart() {
  const max = Math.max(...CANDIDATES.map((c) => c.logit));
  const min = Math.min(...CANDIDATES.map((c) => c.logit));
  const range = max - min;
  return (
    <div className="w-full max-w-lg space-y-2.5">
      <p className="mb-2 text-[11px] uppercase tracking-wide text-graphite/70">"The cat sat on the ___" → raw logits</p>
      {CANDIDATES.map((c, i) => {
        const pct = ((c.logit - min) / range) * 100;
        return (
          <div key={c.token} className="flex items-center gap-2">
            <span className="w-16 shrink-0 font-mono text-[12px] text-paper">{c.token}</span>
            <div className="h-5 flex-1 overflow-hidden rounded-md bg-void-raised">
              <motion.div
                className="h-full rounded-md bg-signal-cyan"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max(pct, 4)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              />
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-[11px] text-graphite">{c.logit.toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
}