'use client';

import { motion } from 'framer-motion';

const SEQUENCE = [
  { text: 'BOS', special: true },
  { text: 'The', special: false },
  { text: 'cat', special: false },
  { text: 'sat', special: false },
  { text: '<|user|>', special: true },
  { text: 'Hi', special: false },
  { text: 'there', special: false },
  { text: 'EOS', special: true },
];

export function SpecialTokensDiagram() {
  return (
    <svg viewBox="0 0 620 120" className="w-full max-w-2xl" role="img" aria-label="Sequence of tokens showing special BOS, turn marker, and EOS tokens interleaved with ordinary tokens">
      {SEQUENCE.map((tok, i) => {
        const w = tok.special ? 74 : 52;
        const gap = 8;
        const x = SEQUENCE.slice(0, i).reduce((acc, t, j) => acc + (t.special ? 74 : 52) + gap, 10);
        return (
          <motion.g key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
            <rect x={x} y={30} width={w} height={40} rx={8} fill={tok.special ? '#2563eb' : '#eff6ff'} stroke={tok.special ? '#1d4ed8' : '#93c5fd'} />
            <text x={x + w / 2} y={54} textAnchor="middle" fontSize={tok.special ? 10 : 11} fontFamily="ui-monospace, monospace" fontWeight={600} fill={tok.special ? '#fff' : '#1e3a8a'}>
              {tok.text}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}