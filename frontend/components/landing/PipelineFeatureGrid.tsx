'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scissors, Orbit, ArrowLeftRight, Network, Layers, Target } from 'lucide-react';

const STAGES = [
  { slug: 'tokenization', n: 3, icon: Scissors, title: 'Tokenization', hook: 'Watch your exact sentence get sliced into the pieces the model actually reads.' },
  { slug: 'vector-embeddings', n: 4, icon: Orbit, title: 'Vector Embeddings', hook: 'Every word becomes a point in a space where meaning has geometry.' },
  { slug: 'positional-encoding', n: 5, icon: ArrowLeftRight, title: 'Positional Encoding', hook: '"Dog bites man" vs "Man bites dog" — see how order gets encoded back in.' },
  { slug: 'self-attention', n: 6, icon: Network, title: 'Self-Attention', hook: 'The mechanism the whole field is built on — Q, K, V, live and visualized.' },
  { slug: 'feed-forward-network', n: 7, icon: Layers, title: 'Feed-Forward Network', hook: 'Where two-thirds of the model\'s knowledge actually lives.' },
  { slug: 'prediction', n: 10, icon: Target, title: 'Prediction', hook: 'One token chosen, fed back in, repeated — until a full reply exists.' },
];

export function PipelineFeatureGrid() {
  return (
    <section className="mx-auto mt-28 max-w-5xl px-6">
      <div className="mb-10 text-center">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-signal-cyan">Six stages. One transformer.</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-paper sm:text-4xl">Nothing here is a black box anymore.</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAGES.map((s, i) => (
          <motion.div
            key={s.slug}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              href={`/chapters/${s.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-graphite-dim bg-white p-5 transition-all hover:-translate-y-1 hover:border-signal-cyan/40 hover:shadow-glow-cyan"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-cyan/10 text-signal-cyan">
                  <s.icon className="h-4.5 w-4.5" />
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-wide text-graphite">Chapter {s.n}</span>
              </div>
              <p className="font-display text-base font-semibold text-paper">{s.title}</p>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-graphite">{s.hook}</p>
              <span className="mt-3 inline-flex items-center gap-1 font-mono text-[12px] font-medium text-signal-cyan opacity-0 transition-opacity group-hover:opacity-100">
                Read the chapter →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}