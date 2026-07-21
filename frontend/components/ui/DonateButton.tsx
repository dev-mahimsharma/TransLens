'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfettiBurst } from './Confetti';

const MOUTH_SAD = 'M8,16 Q12,12 16,16';
const MOUTH_HAPPY = 'M7,13 Q12,19 17,13';

export function DonateButton() {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [burst, setBurst] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  function handleClick() {
    setBurst(true);
    setRedirecting(true);
    setTimeout(() => router.push('/donate'), 550);
    setTimeout(() => setRedirecting(false), 1800);
  }

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
        className="relative flex items-center gap-2 rounded-full border border-ember/30 bg-ember/5 px-4 py-2 text-sm font-semibold text-ember transition-colors hover:bg-ember hover:text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <motion.circle cx="8.5" cy="10" r="1.3" fill="currentColor" style={{ originY: '10px' }} animate={{ scaleY: hovered ? 0.35 : 1 }} transition={{ duration: 0.25 }} />
          <motion.circle cx="15.5" cy="10" r="1.3" fill="currentColor" style={{ originY: '10px' }} animate={{ scaleY: hovered ? 0.35 : 1 }} transition={{ duration: 0.25 }} />
          <motion.path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ d: MOUTH_SAD }}
            animate={{ d: hovered ? MOUTH_HAPPY : MOUTH_SAD }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          />
        </svg>
        Donate
        <AnimatePresence>{burst && <ConfettiBurst onDone={() => setBurst(false)} />}</AnimatePresence>
      </button>

      <AnimatePresence>
        {redirecting && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-paper px-3 py-1.5 text-xs font-medium text-white shadow-lg"
          >
            Taking you there… ❤️
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}