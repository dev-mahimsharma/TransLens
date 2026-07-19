'use client';
import { motion } from 'framer-motion';

const STEPS = [
  { title: 'QKᵀ', desc: 'Dot product every Query with every Key — raw relevance scores.' },
  { title: '÷ √dₖ', desc: 'Scale down so scores don\'t explode as dimension grows.' },
  { title: 'softmax', desc: 'Turn scores into a probability distribution that sums to 1.' },
  { title: '× V', desc: 'Blend Values, weighted by those probabilities.' },
];

export function ScaledDotProductDiagram() {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 rounded-xl bg-void-raised p-4 text-center font-mono text-sm text-paper">
        Attention(Q, K, V) = softmax( QKᵀ / √dₖ ) · V
      </div>
      <div className="flex flex-wrap items-stretch gap-2">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="flex min-w-[130px] flex-1 flex-col gap-1 rounded-xl border border-graphite-dim bg-void p-3"
          >
            <span className="font-mono text-sm font-bold text-signal-cyan">{s.title}</span>
            <span className="text-[11.5px] leading-snug text-graphite">{s.desc}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}