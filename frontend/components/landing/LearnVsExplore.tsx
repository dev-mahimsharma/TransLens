'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Compass, ArrowRight } from 'lucide-react';

export function LearnVsExplore() {
  return (
    <section className="mx-auto mt-28 max-w-5xl px-6">
      <div className="mb-10 text-center">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">Two ways in — pick your pace</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-paper sm:text-4xl">Read it. Or run it yourself.</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <Link
            href="/chapters/introduction"
            className="group flex h-full flex-col rounded-2xl border border-signal-cyan/25 bg-signal-cyan/[0.04] p-7 transition-all hover:border-signal-cyan/50 hover:shadow-glow-cyan"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-signal-cyan/10 text-signal-cyan">
              <BookOpen className="h-5 w-5" />
            </span>
            <h3 className="font-display text-xl font-semibold text-paper">Learn</h3>
            <p className="mt-2 flex-1 text-[14px] leading-relaxed text-graphite">
              Eleven chapters, ground-up: from "what even is AI" to a faithful rebuild of the Transformer
              architecture diagram. Quizzes, glossary, real analogies — built for someone who wants to actually
              understand it, not just watch a demo.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-signal-cyan">
              Start Chapter 1 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <a
            href="#prompt-input"
            className="group flex h-full flex-col rounded-2xl border border-signal-violet/25 bg-signal-violet/[0.04] p-7 transition-all hover:border-signal-violet/50 hover:shadow-glow-violet"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-signal-violet/10 text-signal-violet">
              <Compass className="h-5 w-5" />
            </span>
            <h3 className="font-display text-xl font-semibold text-paper">Explore</h3>
            <p className="mt-2 flex-1 text-[14px] leading-relaxed text-graphite">
              Type your own prompt and watch real GPT-2 process it live — tokens, vectors, attention weights,
              predictions, all computed in front of you. No theory required first. Just type and see.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-signal-violet">
              Try a prompt now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}