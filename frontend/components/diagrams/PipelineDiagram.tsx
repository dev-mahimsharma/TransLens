'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getIcon } from '@/lib/icon-map';

const STAGES = [
  { slug: 'prompt', label: 'Prompt', icon: 'MessageSquare', desc: 'Your raw text input.' },
  { slug: 'tokenization', label: 'Tokenize', icon: 'Scissors', desc: 'Text → sequence of token IDs.' },
  { slug: 'vector-embeddings', label: 'Embed', icon: 'Orbit', desc: 'Each token ID → a meaning vector.' },
  { slug: 'positional-encoding', label: 'Position', icon: 'ArrowLeftRight', desc: 'Inject word-order information.' },
  { slug: 'self-attention', label: 'Attention', icon: 'Network', desc: 'Tokens weigh relevance to each other.' },
  { slug: 'feed-forward-network', label: 'Feed-Forward', icon: 'Layers', desc: "Per-token nonlinear processing." },
  { slug: 'logits', label: 'Logits', icon: 'BarChart3', desc: 'Raw score per vocabulary token.' },
  { slug: 'sampling', label: 'Sample', icon: 'Dices', desc: 'Turn scores into a probability pick.' },
  { slug: 'prediction', label: 'Predict', icon: 'Target', desc: 'Emit the next token, repeat.' },
];

export function PipelineDiagram() {
  const [active, setActive] = useState(0);

  return (
    <div className="my-8 rounded-2xl border border-graphite-dim bg-gradient-to-b from-signal-cyan/5 to-transparent p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        {STAGES.map((s, i) => {
          const Icon = getIcon(s.icon);
          const isActive = i === active;
          return (
            <div key={s.slug} className="flex items-center gap-2">
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 transition-all ${
                  isActive ? 'border-signal-cyan bg-signal-cyan text-white shadow-glow-cyan' : 'border-graphite-dim bg-white text-graphite hover:border-signal-cyan/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap text-[11px] font-medium">{s.label}</span>
              </button>
              {i < STAGES.length - 1 && <span className="text-graphite/30">→</span>}
            </div>
          );
        })}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-white p-4"
      >
        <p className="text-sm text-graphite"><span className="font-semibold text-paper">{STAGES[active].label}:</span> {STAGES[active].desc}</p>
        <Link href={`/chapters/${STAGES[active].slug}`} className="shrink-0 whitespace-nowrap rounded-lg bg-signal-cyan px-3.5 py-1.5 text-xs font-medium text-white hover:bg-signal-cyan/90">
          Open chapter →
        </Link>
      </motion.div>
    </div>
  );
}