'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';
import type { GlossaryBlock } from '@/types/chapter';
import { cn } from '@/lib/utils';

export function Glossary({ block }: { block: GlossaryBlock }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="my-8 rounded-2xl border border-graphite-dim">
      <div className="flex items-center gap-2 border-b border-graphite-dim px-5 py-3 text-sm font-semibold text-paper">
        <BookOpen className="h-4 w-4 text-signal-cyan" /> Glossary
      </div>
      <div className="divide-y divide-graphite-dim">
        {block.terms.map((t) => {
          const isOpen = open === t.term;
          return (
            <div key={t.term}>
              <button
                onClick={() => setOpen(isOpen ? null : t.term)}
                className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-[13.5px] font-medium text-paper hover:bg-slate-50"
              >
                {t.term}
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-graphite/60 transition-transform', isOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-4 text-[13.5px] leading-relaxed text-graphite">{t.definition}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}