'use client';
import { motion } from 'framer-motion';

const HEADS = 4;
const COLORS = ['#2563EB', '#4F46E5', '#059669', '#EF4444'];

export function MultiHeadAttentionDiagram() {
  return (
    <svg viewBox="0 0 560 260" className="w-full max-w-xl" role="img" aria-label="Input split into multiple attention heads, each attending independently, then concatenated and projected">
      <rect x={20} y={105} width={90} height={50} rx={10} fill="#F8F9FB" stroke="#E5E7EB" />
      <text x={65} y={135} textAnchor="middle" fontSize={11} fontWeight={700} fill="#111827">Input</text>

      {Array.from({ length: HEADS }).map((_, i) => {
        const y = 20 + i * 55;
        return (
          <motion.g key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <path d={`M110,130 C170,130 170,${y + 20} 230,${y + 20}`} fill="none" stroke={COLORS[i]} strokeWidth={1.5} strokeDasharray="3 3" />
            <rect x={230} y={y} width={110} height={40} rx={8} fill={`${COLORS[i]}14`} stroke={COLORS[i]} />
            <text x={285} y={y + 24} textAnchor="middle" fontSize={10} fontWeight={700} fill={COLORS[i]}>Head {i + 1}</text>
            <path d={`M340,${y + 20} C400,${y + 20} 400,130 430,130`} fill="none" stroke={COLORS[i]} strokeWidth={1.5} strokeDasharray="3 3" />
          </motion.g>
        );
      })}

      <rect x={430} y={105} width={110} height={50} rx={10} fill="#F8F9FB" stroke="#E5E7EB" />
      <text x={485} y={126} textAnchor="middle" fontSize={10} fontWeight={700} fill="#111827">Concat</text>
      <text x={485} y={142} textAnchor="middle" fontSize={9} fill="#6B7280">+ project</text>
    </svg>
  );
}