'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { ChapterMeta } from '@/types/chapter';
import { getIcon } from '@/lib/icon-map';
import { cn } from '@/lib/utils';

interface TocItem { id: string; label: string; level: 2 | 3 }

export function Sidebar({
  allChapters,
  toc,
  open,
  onClose,
}: {
  allChapters: ChapterMeta[];
  toc: TocItem[];
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const activeSlug = pathname?.split('/').pop();
  let lastUnit = '';

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-paper/10 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 shrink-0 overflow-y-auto border-r border-graphite-dim bg-white pt-[4.5rem] transition-transform lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-4.5rem)] lg:translate-x-0 lg:pt-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="space-y-6 p-5">
          <div>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-graphite/60">Course</p>
            <nav className="space-y-0.5">
              {allChapters.map((c) => {
                const Icon = getIcon(c.icon);
                const isActive = c.slug === activeSlug;
                const showUnit = c.unit !== lastUnit;
                lastUnit = c.unit;
                return (
                  <div key={c.slug}>
                    {showUnit && (
                      <p className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-graphite/45 first:mt-0">{c.unit}</p>
                    )}
                    <Link
                      href={`/chapters/${c.slug}`}
                      onClick={onClose}
                      className={cn(
                        'group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors',
                        isActive ? 'bg-signal-cyan/10 font-medium text-signal-cyan' : 'text-graphite hover:bg-slate-50 hover:text-paper'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-signal-cyan' : 'text-graphite/60 group-hover:text-paper')} />
                      <span className="truncate">{c.number}. {c.title}</span>
                      {c.status === 'complete' ? (
                        <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0 text-signal-cyan" />
                      ) : (
                        <Circle className="ml-auto h-3.5 w-3.5 shrink-0 text-graphite/25" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>

          {toc.length > 0 && (
            <div className="border-t border-graphite-dim pt-5">
              <p className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-graphite/60">
                <Clock className="h-3 w-3" /> On this page
              </p>
              <nav className="space-y-0.5">
                {toc.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className={cn(
                      'block truncate rounded-md px-2 py-1.5 text-[13px] text-graphite hover:bg-slate-50 hover:text-paper',
                      t.level === 3 && 'pl-5'
                    )}
                  >
                    {t.label}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}