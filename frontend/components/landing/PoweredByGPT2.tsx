'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, ShieldCheck } from 'lucide-react';

const FACTS = [
  { label: 'Model', value: 'GPT-2 Small' },
  { label: 'Parameters', value: '124M' },
  { label: 'Transformer layers', value: '12' },
  { label: 'Attention heads', value: '12' },
];

export function PoweredByGPT2() {
  return (
    <section className="mx-auto mt-28 max-w-4xl px-6 text-center">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-signal-cyan/30 bg-signal-cyan/5 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-signal-cyan">
        <ShieldCheck className="h-3.5 w-3.5" /> Not a cartoon. Not a mock-up.
      </span>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
        Every number on this site comes from a real, running <span className="text-signal-cyan">GPT-2</span>.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-graphite">
        We use GPT-2 specifically because it's small enough to inspect live in your browser — but it is a genuine
        Transformer, built from the exact same self-attention, feed-forward, and positional-encoding blocks that power
        GPT-4, Claude, and every other modern LLM. What you see here isn't an illustration of how attention works.
        It's the actual attention weights, computed from actual trained weights, for the actual prompt you typed.
      </p>

      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        {FACTS.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-graphite-dim bg-void-raised p-4"
          >
            <p className="font-display text-xl font-bold text-paper">{f.value}</p>
            <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wide text-graphite">{f.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link href="/chapters/self-attention" className="font-medium text-signal-cyan underline underline-offset-2 hover:text-signal-cyan/80">
          See exactly how self-attention works →
        </Link>
        <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-graphite hover:text-paper">
          Read the original paper <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}