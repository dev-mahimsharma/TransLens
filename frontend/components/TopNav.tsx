'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { DonateButton } from './ui/DonateButton';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.68-1.29-1.68-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.3-.52-1.5.11-3.13 0 0 .97-.31 3.2 1.18a11.1 11.1 0 0 1 5.83 0c2.22-1.49 3.19-1.18 3.19-1.18.63 1.63.23 2.83.12 3.13.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

const REPO_URL = 'https://github.com/dev-mahimsharma/TransLens';

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-lg transition-shadow duration-300 ${
        scrolled ? 'border-graphite-dim shadow-[0_8px_24px_-18px_rgba(37,99,235,0.35)]' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="TransLens home">
          <motion.span
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14 }}
            className="grid h-8 w-8 place-items-center rounded-lg bg-signal-cyan text-base font-bold text-white shadow-glow-cyan"
          >
            T
          </motion.span>
          <span className="font-display text-xl font-semibold tracking-tight text-paper">TransLens</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/chapters/introduction"
            className="flex items-center gap-1.5 rounded-lg bg-signal-cyan px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Chapters</span>
          </Link>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-graphite-dim px-4 py-2 text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-void-raised"
          >
            <GithubIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Contribute</span>
          </a>

          <div className="hidden h-6 w-px bg-graphite-dim sm:block" />

          <DonateButton />
        </div>
      </div>
    </nav>
  );
}