import type { KeyTakeawaysBlock } from '@/types/chapter';
import { getIcon } from '@/lib/icon-map';

export function KeyTakeaways({ block }: { block: KeyTakeawaysBlock }) {
  return (
    <div className="my-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {block.items.map((item, i) => {
        const Icon = getIcon(item.icon);
        return (
          <div key={i} className="rounded-xl border border-graphite-dim bg-slate-50/60 p-4 transition-colors hover:border-signal-cyan/40 hover:bg-signal-cyan/5">
            <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-signal-cyan/10">
              <Icon className="h-4 w-4 text-signal-cyan" />
            </span>
            <p className="text-sm font-semibold text-paper">{item.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-graphite">{item.body}</p>
          </div>
        );
      })}
    </div>
  );
}