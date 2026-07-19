import type { ReactNode } from 'react';

export function DiagramFrame({ title, caption, children }: { title: string; caption?: string; children: ReactNode }) {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-graphite-dim bg-gradient-to-b from-slate-50/60 to-transparent">
      <div className="border-b border-graphite-dim px-5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-signal-cyan">{title}</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">{children}</div>
      {caption && (
        <figcaption className="border-t border-graphite-dim px-5 py-3 text-center text-[12.5px] italic text-graphite/80">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}