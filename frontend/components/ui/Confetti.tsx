'use client';

import { motion } from 'framer-motion';

const DEFAULT_COLORS = ['#EF4444', '#EC4899', '#F59E0B', '#4F46E5', '#059669', '#2563EB'];

export function ConfettiBurst({
  count = 14,
  colors = DEFAULT_COLORS,
  spread = 42,
  onDone,
}: {
  count?: number;
  colors?: string[];
  spread?: number;
  onDone?: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const dist = spread + (i % 3) * (spread / 3);
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x, y: y - spread * 0.2, opacity: 0, rotate: (i % 2 === 0 ? 1 : -1) * 260, scale: 0.6 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            onAnimationComplete={onDone && i === count - 1 ? onDone : undefined}
            className="absolute h-3 w-1.5 rounded-full"
            style={{ background: colors[i % colors.length] }}
          />
        );
      })}
    </div>
  );
}