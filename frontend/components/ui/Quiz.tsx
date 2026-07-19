'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, HelpCircle } from 'lucide-react';
import type { QuizBlock } from '@/types/chapter';
import { cn } from '@/lib/utils';

function Question({ q, index }: { q: QuizBlock['questions'][number]; index: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <div className="rounded-xl border border-graphite-dim p-4 sm:p-5">
      <p className="mb-3 text-sm font-medium text-paper">
        <span className="mr-1.5 text-graphite/60">{index + 1}.</span>{q.question}
      </p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          const isPicked = i === selected;
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setSelected(i)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-[13.5px] transition-colors disabled:cursor-default',
                !answered && 'border-graphite-dim hover:border-signal-cyan/50 hover:bg-signal-cyan/5',
                answered && isCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                answered && isPicked && !isCorrect && 'border-rose-300 bg-rose-50 text-rose-800',
                answered && !isPicked && !isCorrect && 'border-graphite-dim text-graphite/50'
              )}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">
                {answered && isCorrect ? <Check className="h-3 w-3" /> : answered && isPicked ? <X className="h-3 w-3" /> : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-[13px] leading-relaxed text-graphite">{q.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Quiz({ block }: { block: QuizBlock }) {
  return (
    <div className="my-8 rounded-2xl border border-signal-cyan/20 bg-signal-cyan/5 p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-signal-cyan">
        <HelpCircle className="h-4 w-4" /> {block.title}
      </div>
      <div className="space-y-3">
        {block.questions.map((q, i) => <Question key={q.id} q={q} index={i} />)}
      </div>
    </div>
  );
}