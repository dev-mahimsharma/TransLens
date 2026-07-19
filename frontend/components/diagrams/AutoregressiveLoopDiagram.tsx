'use client';
import { motion } from 'framer-motion';

const STEPS = ['The', 'cat', 'sat', '…'];

export function AutoregressiveLoopDiagram() {
  return (
    <svg viewBox="0 0 560 180" className="w-full max-w-xl" role="img" aria-label="Autoregressive loop: model output is appended to the input and fed back in for the next prediction">
      <rect x={220} y={20} width={120} height={50} rx={10} fill="#2563EB14" stroke="#2563EB" strokeWidth={1.5} />
      <text x={280} y={50} textAnchor="middle" fontSize={11} fontWeight={700} fill="#2563EB">Model</text>

      {STEPS.map((s, i) => (
        <motion.g key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}>
          <rect x={20 + i * 130} y={120} width={100} height={36} rx={8} fill="#F8F9FB" stroke="#E5E7EB" />
          <text x={70 + i * 130} y={143} textAnchor="middle" fontSize={11} fontFamily="ui-monospace, monospace" fill="#111827">{s}</text>
        </motion.g>
      ))}
      <path d="M280,120 C280,90 280,90 280,70" fill="none" stroke="#6B7280" strokeWidth={1.5} markerEnd="url(#arrow2)" />
      <path d="M280,70 C280,100 420,150 400,138" fill="none" stroke="#4F46E5" strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrow2)" />
      <defs>
        <marker id="arrow2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="#6B7280" />
        </marker>
      </defs>
      <text x={430} y={100} fontSize={10} fill="#4F46E5">predicted token appended</text>
    </svg>
  );
}