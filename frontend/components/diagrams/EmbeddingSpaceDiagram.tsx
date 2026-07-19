'use client';
import { motion } from 'framer-motion';

const POINTS = [
  { label: 'king', x: 120, y: 80, cluster: 0 },
  { label: 'queen', x: 150, y: 60, cluster: 0 },
  { label: 'prince', x: 100, y: 110, cluster: 0 },
  { label: 'dog', x: 380, y: 200, cluster: 1 },
  { label: 'puppy', x: 410, y: 175, cluster: 1 },
  { label: 'cat', x: 355, y: 230, cluster: 1 },
  { label: 'run', x: 250, y: 320, cluster: 2 },
  { label: 'sprint', x: 280, y: 300, cluster: 2 },
];

const CLUSTER_COLOR = ['#2563EB', '#4F46E5', '#059669'];

export function EmbeddingSpaceDiagram() {
  return (
    <svg viewBox="0 0 500 380" className="w-full max-w-lg" role="img" aria-label="2D projection of word embeddings showing related words clustering together">
      <rect x={0} y={0} width={500} height={380} rx={16} fill="#F8F9FB" />
      {POINTS.map((p, i) => (
        <motion.g key={p.label} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08, type: 'spring' }}>
          <circle cx={p.x} cy={p.y} r={6} fill={CLUSTER_COLOR[p.cluster]} />
          <text x={p.x + 10} y={p.y + 4} fontSize={12} fontWeight={600} fill="#111827">{p.label}</text>
        </motion.g>
      ))}
    </svg>
  );
}