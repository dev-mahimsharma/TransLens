'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, BookOpen, Copy, Check } from 'lucide-react';
import { ConfettiBurst } from '@/components/ui/Confetti';

export function ThankYouContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [amount, setAmount] = useState<number | null>(null);
  const [showBurst, setShowBurst] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/donate/verify?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.amount === 'number') setAmount(d.amount / 100);
      })
      .catch(() => {});
  }, [sessionId]);

  function handleShare() {
    const text = encodeURIComponent(
      'I just supported TransLens — a free, interactive site that shows exactly how LLMs work under the hood. Check it out:'
    );
    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  }

  function handleCopy() {
    navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.origin : '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative">
        {showBurst && <ConfettiBurst count={28} spread={90} onDone={() => setShowBurst(false)} />}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="relative z-10 text-6xl"
        >
          🎉
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 font-display text-3xl font-bold tracking-tight text-paper sm:text-4xl"
      >
        Thank you{amount ? ` — your $${amount.toFixed(2)}` : ''} just kept TransLens alive.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 max-w-md text-[15px] leading-relaxed text-graphite"
      >
        It's going straight back into hosting, live GPT-2 compute time, and keeping this site free and ad-free —
        for you, and for everyone who finds it after you.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="flex items-center gap-1.5 rounded-xl bg-signal-cyan px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700">
          <Home className="h-4 w-4" /> Back to home
        </Link>
        <Link href="/chapters/introduction" className="flex items-center gap-1.5 rounded-xl border border-graphite-dim px-5 py-3 text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-void-raised">
          <BookOpen className="h-4 w-4" /> Browse chapters
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-6 flex items-center justify-center gap-5 text-xs">
        <button onClick={handleShare} className="text-graphite transition-colors hover:text-paper">
          Share on X →
        </button>
        <button onClick={handleCopy} className="flex items-center gap-1 text-graphite transition-colors hover:text-paper">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </motion.div>
    </main>
  );
}