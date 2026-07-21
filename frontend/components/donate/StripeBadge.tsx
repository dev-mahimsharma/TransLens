'use client';

import { Lock } from 'lucide-react';

export function StripeBadge() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-graphite-dim bg-void-raised p-4">
      <div className="flex items-center gap-1.5 text-graphite">
        <Lock className="h-3.5 w-3.5" />
        <span className="font-mono text-[10.5px] uppercase tracking-wide">Payments secured by</span>
      </div>

      <svg width="64" height="27" viewBox="0 0 64 27" role="img" aria-label="Stripe">
        <rect width="64" height="27" rx="6" fill="#635BFF" />
        <text x="32" y="18.5" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="13" fontWeight="700" fill="#fff">
          stripe
        </text>
      </svg>

      <div className="flex items-center gap-1.5">
        {['VISA', 'MC', 'AMEX'].map((c) => (
          <span key={c} className="rounded border border-graphite-dim px-1.5 py-0.5 font-mono text-[9.5px] text-graphite">
            {c}
          </span>
        ))}
      </div>

      <p className="max-w-[230px] text-center text-[11px] leading-relaxed text-graphite">
        We never see, touch, or store your card details. Stripe handles the entire transaction on PCI-compliant
        infrastructure — the same processor used by Amazon, Shopify, and Google.
      </p>
    </div>
  );
}