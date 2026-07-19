'use client';
import { motion } from 'framer-motion';

const OUTS = [
  { label: 'Query (Q)', sub: 'What am I looking for?', color: '#2563EB', y: 30 },
  { label: 'Key (K)', sub: 'What do I contain?', color: '#4F46E5', y: 110 },
  { label: 'Value (V)', sub: 'What do I actually offer?', color: '#059669', y: 190 },
];

export function QKVDiagram() {
  return (
    <svg viewBox="0 0 560 240" className="w-full max-w-xl" role="img" aria-label="One token embedding multiplied by three learned weight matrices to produce Query, Key, and Value vectors">
      <rect x={20} y={95} width={110} height={50} rx={10} fill="#F8F9FB" stroke="#E5E7EB" />
      <text x={75} y={115} textAnchor="middle" fontSize={11} fontWeight={700} fill="#111827">Token</text>
      <text x={75} y={130} textAnchor="middle" fontSize={10} fill="#6B7280">embedding x</text>

      {OUTS.map((o, i) => (
        <motion.g key={o.label} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
          <motion.path
            d={`M130,120 C220,120 220,${o.y + 25} 300,${o.y + 25}`}
            fill="none" stroke={o.color} strokeWidth={1.5} strokeDasharray="4 3"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}
          />
          <text x={215} y={o.y + 15} fontSize={10} fill={o.color} fontFamily="ui-monospace, monospace">× W{o.label[0]}</text>
          <rect x={300} y={o.y} width={240} height={50} rx={10} fill={`${o.color}12`} stroke={o.color} strokeWidth={1.5} />
          <text x={318} y={o.y + 20} fontSize={12} fontWeight={700} fill={o.color}>{o.label}</text>
          <text x={318} y={o.y + 36} fontSize={10} fill="#6B7280">{o.sub}</text>
        </motion.g>
      ))}
    </svg>
  );
}