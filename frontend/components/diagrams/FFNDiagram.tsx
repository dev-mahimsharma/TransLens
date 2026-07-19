'use client';
import { motion } from 'framer-motion';

export function FFNDiagram() {
  return (
    <svg viewBox="0 0 560 200" className="w-full max-w-xl" role="img" aria-label="Feed-forward network: linear layer expands dimensionality, activation, linear layer contracts back">
      {[
        { x: 20, w: 70, label: 'd_model', n: 4, color: '#6B7280' },
        { x: 160, w: 130, label: '4× d_model', n: 8, color: '#2563EB' },
        { x: 380, w: 70, label: 'd_model', n: 4, color: '#6B7280' },
      ].map((col, ci) => (
        <g key={ci}>
          {Array.from({ length: col.n }).map((_, i) => (
            <motion.circle
              key={i}
              cx={col.x + col.w / 2}
              cy={30 + i * (140 / (col.n - 1))}
              r={7}
              fill={`${col.color}22`}
              stroke={col.color}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.2 + i * 0.03 }}
            />
          ))}
          <text x={col.x + col.w / 2} y={190} textAnchor="middle" fontSize={10} fontWeight={600} fill={col.color}>{col.label}</text>
        </g>
      ))}
      <text x={280} y={16} textAnchor="middle" fontSize={10} fill="#6B7280">GELU / ReLU activation</text>
    </svg>
  );
}