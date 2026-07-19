'use client';
import { motion } from 'framer-motion';

function wavePath(freq: number, amp: number, phase: number, w: number, h: number) {
  let d = '';
  for (let x = 0; x <= w; x += 4) {
    const y = h / 2 - amp * Math.sin((x / w) * Math.PI * 2 * freq + phase);
    d += `${x === 0 ? 'M' : 'L'}${x},${y} `;
  }
  return d;
}

const DIMS = [
  { freq: 1, amp: 24, color: '#2563EB' },
  { freq: 2, amp: 24, color: '#4F46E5' },
  { freq: 4, amp: 24, color: '#059669' },
];

export function PositionalEncodingWave() {
  return (
    <svg viewBox="0 0 560 260" className="w-full max-w-xl" role="img" aria-label="Sine and cosine waves of different frequencies used to encode token position">
      {DIMS.map((d, i) => (
        <motion.path
          key={i}
          d={wavePath(d.freq, d.amp, 0, 560, 70)}
          transform={`translate(0, ${i * 80 + 20})`}
          fill="none"
          stroke={d.color}
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: i * 0.2 }}
        />
      ))}
      {DIMS.map((d, i) => (
        <text key={i} x={10} y={i * 80 + 15} fontSize={10} fontFamily="ui-monospace, monospace" fill={d.color}>dim {i * 2}/{i * 2 + 1} — freq ×{d.freq}</text>
      ))}
    </svg>
  );
}