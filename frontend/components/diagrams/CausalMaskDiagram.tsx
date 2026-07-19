'use client';
import { motion } from 'framer-motion';

const TOKENS = ['The', 'cat', 'sat', 'down'];

export function CausalMaskDiagram() {
  const n = TOKENS.length;
  const cell = 50, offset = 60;
  return (
    <svg viewBox={`0 0 ${offset + n * cell + 20} ${offset + n * cell + 20}`} className="w-full max-w-sm" role="img" aria-label="Lower-triangular causal mask: each token can only attend to itself and earlier tokens">
      {TOKENS.map((t, i) => (
        <text key={`col-${i}`} x={offset + i * cell + cell / 2} y={30} textAnchor="middle" fontSize={11} fontWeight={600} fill="#111827">{t}</text>
      ))}
      {TOKENS.map((t, i) => (
        <text key={`row-${i}`} x={offset - 10} y={offset + i * cell + cell / 2 + 4} textAnchor="end" fontSize={11} fontWeight={600} fill="#111827">{t}</text>
      ))}
      {TOKENS.map((_, r) =>
        TOKENS.map((_, c) => {
          const allowed = c <= r;
          return (
            <motion.rect
              key={`${r}-${c}`}
              x={offset + c * cell + 2}
              y={offset + r * cell + 2}
              width={cell - 4}
              height={cell - 4}
              rx={6}
              fill={allowed ? '#2563EB22' : '#E5E7EB'}
              stroke={allowed ? '#2563EB' : '#D1D5DB'}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (r * n + c) * 0.03 }}
            />
          );
        })
      )}
    </svg>
  );
}