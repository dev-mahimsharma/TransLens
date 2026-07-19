'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const BASE_LOGITS = [
  { token: 'mat', logit: 8.2 },
  { token: 'floor', logit: 6.9 },
  { token: 'chair', logit: 4.1 },
  { token: 'rug', logit: 3.4 },
  { token: 'moon', logit: -1.5 },
  { token: 'banana', logit: -3.8 },
];

function softmax(logits: number[], temp: number) {
  const scaled = logits.map((l) => l / Math.max(temp, 0.05));
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export function SamplingPlayground() {
  const [temp, setTemp] = useState(1);
  const [topK, setTopK] = useState(6);

  const probs = useMemo(() => {
    const p = softmax(BASE_LOGITS.map((c) => c.logit), temp);
    const ranked = BASE_LOGITS.map((c, i) => ({ ...c, p: p[i] })).sort((a, b) => b.p - a.p);
    const kept = ranked.slice(0, topK);
    const keptSum = kept.reduce((a, c) => a + c.p, 0);
    return kept.map((c) => ({ ...c, p: c.p / keptSum }));
  }, [temp, topK]);

  return (
    <div className="w-full max-w-lg">
      <div className="mb-5 grid grid-cols-2 gap-4">
        <label className="text-[12px] text-graphite">
          Temperature: <span className="font-mono font-semibold text-paper">{temp.toFixed(2)}</span>
          <input type="range" min={0.1} max={2} step={0.05} value={temp} onChange={(e) => setTemp(+e.target.value)} className="mt-1 w-full accent-signal-cyan" />
        </label>
        <label className="text-[12px] text-graphite">
          Top-k: <span className="font-mono font-semibold text-paper">{topK}</span>
          <input type="range" min={1} max={6} step={1} value={topK} onChange={(e) => setTopK(+e.target.value)} className="mt-1 w-full accent-signal-cyan" />
        </label>
      </div>
      <div className="space-y-2">
        {probs.map((c) => (
          <div key={c.token} className="flex items-center gap-2">
            <span className="w-16 shrink-0 font-mono text-[12px] text-paper">{c.token}</span>
            <div className="h-5 flex-1 overflow-hidden rounded-md bg-void-raised">
              <motion.div className="h-full rounded-md bg-signal-cyan" animate={{ width: `${c.p * 100}%` }} transition={{ duration: 0.25 }} />
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-[11px] text-graphite">{(c.p * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11.5px] text-graphite/80">Lower temperature → sharper, more confident distribution. Higher → flatter, more random. Top-k caps how many candidates are even considered.</p>
    </div>
  );
}