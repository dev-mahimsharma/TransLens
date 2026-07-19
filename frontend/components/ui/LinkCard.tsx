import { ExternalLink, FileText } from 'lucide-react';
import type { LinkCardBlock } from '@/types/chapter';

export function LinkCard({ block }: { block: LinkCardBlock }) {
  return (
    <a
      href={block.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group my-6 flex items-center gap-4 rounded-xl border border-graphite-dim p-4 transition-all hover:border-signal-cyan/50 hover:shadow-glow-cyan"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal-cyan/10">
        <FileText className="h-5 w-5 text-signal-cyan" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-paper group-hover:text-signal-cyan">{block.text}</p>
        {block.description && <p className="truncate text-[12.5px] text-graphite">{block.description}</p>}
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-graphite/60 group-hover:text-signal-cyan" />
    </a>
  );
}