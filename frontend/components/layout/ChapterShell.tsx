'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import type { Chapter, ChapterMeta } from '@/types/chapter';
import { Sidebar } from './Sidebar';
import { ScrollProgress } from '../ui/ScrollProgress';
import { getIcon } from '@/lib/icon-map';

interface TocItem { id: string; label: string; level: 2 | 3 }

// NOTE: TopNav is already rendered globally in app/layout.tsx, so this shell
// only owns the chapter sidebar + content column — no second nav bar here.
export function ChapterShell({
  chapter,
  toc,
  allChapters,
  children,
}: {
  chapter: Chapter;
  toc: TocItem[];
  allChapters: ChapterMeta[];
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const Icon = getIcon(chapter.meta.icon);

  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />

      {/* mobile TOC toggle — sits under TopNav since we have no local nav bar */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="sticky top-[4.5rem] z-30 m-3 rounded-lg border border-graphite-dim bg-white px-3 py-1.5 text-xs font-medium text-graphite lg:hidden"
      >
        {sidebarOpen ? 'Hide contents' : 'Show contents'}
      </button>

      <div className="mx-auto flex max-w-6xl">
        <Sidebar allChapters={allChapters} toc={toc} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1 px-4 py-10 sm:px-8 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mx-auto max-w-3xl"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-signal-cyan">{chapter.meta.unit}</p>
            <div className="mb-2 flex items-start gap-3">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal-cyan/10">
                <Icon className="h-5 w-5 text-signal-cyan" />
              </span>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-paper sm:text-[2.25rem]">
                Chapter {chapter.meta.number}: {chapter.meta.title}
              </h1>
            </div>
            <p className="mb-4 pl-12 text-lg text-graphite">{chapter.meta.subtitle}</p>
            <div className="mb-10 flex items-center gap-1.5 pl-12 text-xs text-graphite/70">
              <Clock className="h-3.5 w-3.5" /> {chapter.meta.readTime}
            </div>

            <article className="prose-translens">{children}</article>

            <nav className="mt-16 grid grid-cols-1 gap-3 border-t border-graphite-dim pt-8 sm:grid-cols-2">
              {chapter.prev ? (
                <Link
                  href={`/chapters/${chapter.prev.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-graphite-dim p-4 transition-colors hover:border-signal-cyan/50 hover:bg-signal-cyan/5"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0 text-graphite transition-transform group-hover:-translate-x-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-graphite/70">Previous</p>
                    <p className="truncate text-sm font-medium text-paper">{chapter.prev.title}</p>
                  </div>
                </Link>
              ) : <div />}
              {chapter.next && (
                <Link
                  href={`/chapters/${chapter.next.slug}`}
                  className="group flex items-center justify-end gap-3 rounded-xl border border-graphite-dim p-4 text-right transition-colors hover:border-signal-cyan/50 hover:bg-signal-cyan/5"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-graphite/70">Next</p>
                    <p className="truncate text-sm font-medium text-paper">{chapter.next.title}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-graphite transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </nav>
          </motion.div>
        </main>
      </div>
    </div>
  );
}