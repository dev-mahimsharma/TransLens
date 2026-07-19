'use client';
import { motion } from 'framer-motion';

function Block({ x, y, w, h, label, fill, stroke, delay }: { x: number; y: number; w: number; h: number; label: string; fill: string; stroke: string; delay: number }) {
  return (
    <motion.g initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay }}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#111827">{label}</text>
    </motion.g>
  );
}
function Arrow({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke="#6B7280" strokeWidth={1.3} markerEnd="url(#arrow)" />;
}

export function TransformerArchitectureDiagram() {
  const cyan = { fill: '#2563EB14', stroke: '#2563EB' };
  const violet = { fill: '#4F46E514', stroke: '#4F46E5' };
  const gray = { fill: '#F8F9FB', stroke: '#E5E7EB' };

  return (
    <svg viewBox="0 0 620 640" className="w-full max-w-lg" role="img" aria-label="Transformer architecture diagram from Attention Is All You Need showing encoder and decoder stacks">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="#6B7280" />
        </marker>
      </defs>

      {/* ── Encoder (left) ── */}
      <text x={140} y={24} textAnchor="middle" fontSize={12} fontWeight={700} fill="#111827">Encoder ×N</text>
      <Block x={40} y={340} w={200} h={44} label="Feed Forward" fill={cyan.fill} stroke={cyan.stroke} delay={0.5} />
      <Block x={40} y={300} w={200} h={26} label="Add & Norm" fill={gray.fill} stroke={gray.stroke} delay={0.45} />
      <Block x={40} y={220} w={200} h={44} label="Multi-Head Attention" fill={violet.fill} stroke={violet.stroke} delay={0.3} />
      <Block x={40} y={180} w={200} h={26} label="Add & Norm" fill={gray.fill} stroke={gray.stroke} delay={0.25} />
      <Arrow x={140} y1={180} y2={264} />
      <Arrow x={140} y1={264} y2={300} />
      <Arrow x={140} y1={326} y2={340} />
      <Arrow x={140} y1={384} y2={410} />
      <Block x={40} y={100} w={200} h={40} label="Input Embedding" fill={gray.fill} stroke={gray.stroke} delay={0.05} />
      <Block x={40} y={60} w={200} h={26} label="+ Positional Encoding" fill={gray.fill} stroke={gray.stroke} delay={0.1} />
      <Arrow x={140} y1={100} y2={140} />
      <Arrow x={140} y1={140} y2={180} />
      <rect x={30} y={50} width={220} height={344} rx={12} fill="none" stroke="#93C5FD" strokeDasharray="4 3" />

      {/* ── Decoder (right) ── */}
      <text x={480} y={24} textAnchor="middle" fontSize={12} fontWeight={700} fill="#111827">Decoder ×N</text>
      <Block x={380} y={420} w={200} h={44} label="Feed Forward" fill={cyan.fill} stroke={cyan.stroke} delay={0.65} />
      <Block x={380} y={380} w={200} h={26} label="Add & Norm" fill={gray.fill} stroke={gray.stroke} delay={0.6} />
      <Block x={380} y={300} w={200} h={50} label="Cross-Attention (enc→dec)" fill={violet.fill} stroke={violet.stroke} delay={0.5} />
      <Block x={380} y={260} w={200} h={26} label="Add & Norm" fill={gray.fill} stroke={gray.stroke} delay={0.45} />
      <Block x={380} y={180} w={200} h={50} label="Masked Multi-Head Attention" fill={violet.fill} stroke={violet.stroke} delay={0.3} />
      <Block x={380} y={140} w={200} h={26} label="Add & Norm" fill={gray.fill} stroke={gray.stroke} delay={0.25} />
      <Arrow x={480} y1={140} y2={230} />
      <Arrow x={480} y1={230} y2={260} />
      <Arrow x={480} y1={286} y2={300} />
      <Arrow x={480} y1={350} y2={380} />
      <Arrow x={480} y1={406} y2={420} />
      <Arrow x={480} y1={464} y2={500} />
      <Block x={380} y={80} w={200} h={40} label="Output Embedding" fill={gray.fill} stroke={gray.stroke} delay={0.05} />
      <Block x={380} y={40} w={200} h={26} label="+ Positional Encoding" fill={gray.fill} stroke={gray.stroke} delay={0.1} />
      <Arrow x={480} y1={80} y2={120} />
      <Arrow x={480} y1={120} y2={140} />
      <rect x={370} y={30} width={220} height={444} rx={12} fill="none" stroke="#C4B5FD" strokeDasharray="4 3" />

      {/* encoder → decoder cross-attention link */}
      <motion.path d="M240,242 C320,242 320,320 380,320" fill="none" stroke="#4F46E5" strokeWidth={1.5} strokeDasharray="4 3"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.55 }} />

      {/* Output head */}
      <Block x={380} y={500} w={200} h={30} label="Linear" fill={gray.fill} stroke={gray.stroke} delay={0.75} />
      <Arrow x={480} y1={530} y2={550} />
      <Block x={380} y={550} w={200} h={30} label="Softmax" fill={gray.fill} stroke={gray.stroke} delay={0.8} />
      <Arrow x={480} y1={580} y2={600} />
      <text x={480} y={615} textAnchor="middle" fontSize={11} fontWeight={700} fill="#111827">Output probabilities</text>
    </svg>
  );
}