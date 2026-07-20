'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = ['The', 'cat', 'sat', 'on', 'the'];
const ATTN = [0.04, 0.09, 0.14, 0.11, 1]; // fake weights, last token attending backward
const STAGES = [
  { key: 'tokens', label: '1 · Tokens' },
  { key: 'vectors', label: '2 · Vectors' },
  { key: 'attention', label: '3 · Attention' },
  { key: 'prediction', label: '4 · Prediction' },
] as const;

export function LiveMiniPreview() {
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) setActive((a) => (a + 1) % STAGES.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      className="mx-auto mt-20 max-w-3xl px-6"
    >
      <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
        This is happening right now, live, inside every reply
      </p>

      <div className="surface-card overflow-hidden rounded-2xl bg-white p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setActive(i)}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-medium transition-all ${
                i === active ? 'bg-signal-cyan text-white shadow-glow-cyan' : 'bg-void-raised text-graphite hover:text-paper'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-[140px] items-center justify-center">
          <AnimatePresence mode="wait">
            {active === 0 && (
              <motion.div key="tokens" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-wrap justify-center gap-2">
                {WORDS.map((w, i) => (
                  <motion.span key={w} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }} className="rounded-lg border border-signal-cyan/30 bg-signal-cyan/5 px-3 py-1.5 font-mono text-sm text-paper">
                    {w}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {active === 1 && (
              <motion.div key="vectors" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-wrap justify-center gap-4">
                {WORDS.map((w, i) => (
                  <div key={w} className="flex flex-col items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <motion.span
                          key={j}
                          className="h-6 w-1.5 rounded-full bg-signal-violet/70"
                          initial={{ height: 4 }}
                          animate={{ height: 8 + ((i * 7 + j * 13) % 20) }}
                          transition={{ delay: i * 0.05 + j * 0.03 }}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-graphite">{w}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {active === 2 && (
              <motion.div key="attention" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex w-full justify-center gap-3">
                {WORDS.map((w, i) => (
                  <div key={w} className="flex flex-col items-center gap-1">
                    <div
                      className="rounded-lg border px-2.5 py-1.5 font-mono text-[13px] transition-colors"
                      style={{
                        borderColor: i === 4 ? '#2563EB' : '#E5E7EB',
                        background: `rgba(37,99,235,${0.06 + ATTN[i] * 0.3})`,
                        fontWeight: i === 4 ? 700 : 500,
                        color: '#111827',
                      }}
                    >
                      {w}
                    </div>
                    <motion.div
                      className="h-1 rounded-full bg-signal-cyan"
                      initial={{ width: 0 }}
                      animate={{ width: `${8 + ATTN[i] * 26}px` }}
                      transition={{ delay: i * 0.06 }}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {active === 3 && (
              <motion.div key="prediction" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-3">
                <span className="font-mono text-xs text-graphite">The cat sat on the</span>
                <span className="rounded-xl border border-signal-cyan bg-signal-cyan px-5 py-2.5 font-mono text-lg font-bold text-white shadow-glow-cyan animate-pulse-spine">
                  mat
                </span>
                <span className="font-mono text-[11px] text-graphite">chosen with 71% confidence, out of 50,257 possible tokens</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}