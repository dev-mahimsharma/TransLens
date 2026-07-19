'use client';

import { motion } from 'framer-motion';

const RINGS = [
  { label: 'Artificial Intelligence', r: 220, fill: 'rgba(37,99,235,0.05)', stroke: '#93c5fd' },
  { label: 'Machine Learning', r: 178, fill: 'rgba(37,99,235,0.08)', stroke: '#60a5fa' },
  { label: 'Deep Learning', r: 136, fill: 'rgba(37,99,235,0.12)', stroke: '#3b82f6' },
  { label: 'Neural Networks', r: 96, fill: 'rgba(37,99,235,0.18)', stroke: '#2563eb' },
  { label: 'LLMs', r: 60, fill: 'rgba(37,99,235,0.28)', stroke: '#1d4ed8' },
  { label: 'Transformers', r: 30, fill: '#1d4ed8', stroke: '#1e40af' },
];

export function AIFamilyTree() {
  const cx = 260, cy = 250;
  return (
    <svg viewBox="0 0 520 500" className="w-full max-w-xl" role="img" aria-label="Nested diagram of AI, ML, Deep Learning, Neural Networks, LLMs, and Transformers">
      {RINGS.map((ring, i) => (
        <motion.g key={ring.label} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}>
          <circle cx={cx} cy={cy} r={ring.r} fill={ring.fill} stroke={ring.stroke} strokeWidth={1.5} />
        </motion.g>
      ))}
      {RINGS.map((ring, i) => (
        <motion.text
          key={ring.label + '-label'}
          x={cx}
          y={cy - ring.r + (i === RINGS.length - 1 ? 5 : 16)}
          textAnchor="middle"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12 + 0.2 }}
          className="select-none"
          style={{
            fontSize: i >= 4 ? 10 : 11.5,
            fontWeight: 600,
            fill: i === RINGS.length - 1 ? '#fff' : '#1e3a8a',
          }}
        >
          {ring.label}
        </motion.text>
      ))}
    </svg>
  );
}