import { Info, Lightbulb, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { CalloutVariant } from '@/types/chapter';
import { cn } from '@/lib/utils';

const VARIANTS: Record<CalloutVariant, { icon: typeof Info; classes: string; iconClass: string }> = {
  info: { icon: Info, classes: 'border-signal-cyan/25 bg-signal-cyan/5', iconClass: 'text-signal-cyan' },
  didYouKnow: { icon: Lightbulb, classes: 'border-amber-200 bg-amber-50/70', iconClass: 'text-amber-600' },
  misconception: { icon: AlertTriangle, classes: 'border-rose-200 bg-rose-50/70', iconClass: 'text-rose-600' },
  keyPrinciple: { icon: CheckCircle2, classes: 'border-emerald-200 bg-emerald-50/70', iconClass: 'text-emerald-600' },
  warning: { icon: ShieldAlert, classes: 'border-ember/25 bg-ember/5', iconClass: 'text-ember' },
};

export function Callout({ variant, title, body }: { variant: CalloutVariant; title: string; body: string }) {
  const { icon: Icon, classes, iconClass } = VARIANTS[variant];
  return (
    <div className={cn('my-6 rounded-xl border p-4', classes)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-paper">
        <Icon className={cn('h-4 w-4', iconClass)} />
        {title}
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-graphite">{body}</p>
    </div>
  );
}