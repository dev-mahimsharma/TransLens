'use client';
import { motion } from 'framer-motion';

const TURNS = [
  { role: 'system', text: 'You are a helpful assistant.', color: '#6B7280' },
  { role: 'user', text: 'Explain gravity simply.', color: '#4F46E5' },
  { role: 'assistant', text: 'Gravity pulls…', color: '#2563EB' },
];

export function PromptAnatomyDiagram() {
  return (
    <svg viewBox="0 0 560 220" className="w-full max-w-xl" role="img" aria-label="A prompt split into system, user, and assistant turns">
      {TURNS.map((t, i) => (
        <motion.g key={t.role} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
          <rect x={20} y={20 + i * 65} width={520} height={48} rx={10} fill={`${t.color}14`} stroke={t.color} strokeWidth={1.5} />
          <text x={38} y={38 + i * 65} fontSize={10} fontWeight={700} fill={t.color} fontFamily="ui-monospace, monospace">{t.role.toUpperCase()}</text>
          <text x={38} y={56 + i * 65} fontSize={12} fill="#111827">{t.text}</text>
        </motion.g>
      ))}
    </svg>
  );
}