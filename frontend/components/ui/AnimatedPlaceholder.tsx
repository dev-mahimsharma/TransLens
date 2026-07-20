'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLES = [
  'The cat sat on the',
  'My name is',
  'Once upon a time, there was a',
  'The weather today is',
  'In the future, AI will',
];

export function AnimatedPlaceholder({ active }: { active: boolean }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setI((n) => (n + 1) % SAMPLES.length), 2200);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="truncate text-base text-graphite"
        >
          {SAMPLES[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}