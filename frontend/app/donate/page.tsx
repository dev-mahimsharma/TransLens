'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import { StripeBadge } from '@/components/donate/StripeBadge';
import { DonationImpact } from '@/components/donate/DonationImpact';

const PRESETS = [
  { amount: 5, label: 'Buy us a coffee' },
  { amount: 10, label: 'Most chosen' },
  { amount: 25, label: 'Power user' },
  { amount: 50, label: 'Legend' },
  { amount: 100, label: 'Absolute unit' },
];

export default function DonatePage() {
  const [selected, setSelected] = useState(10);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amount = custom ? Number(custom) : selected;

  async function handleDonate() {
    setError('');
    if (!amount || amount < 1) {
      setError('Enter at least $1.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/donate/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents: Math.round(amount * 100) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Something went wrong.');
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message ?? 'Could not start checkout.');
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4.5rem)] max-w-2xl px-6 py-16">
      <Link href="/" className="mb-10 inline-flex items-center gap-1.5 text-sm text-graphite hover:text-paper">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-ember/30 bg-ember/5 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-ember">
          <Heart className="h-3.5 w-3.5" /> Support TransLens
        </span>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-paper sm:text-4xl">
          Every dollar you give funds <span className="text-ember">this website — nothing else.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-graphite">
          You just read something free. Someone made that possible for you before you ever showed up — the servers,
          the live GPT-2 model, the hosting, all paid for in advance, on trust. If this site helped you understand
          something, this is your chance to be that person for the next visitor.
        </p>
      </motion.div>

      <DonationImpact />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-card mt-8 rounded-2xl bg-white p-6 sm:p-8">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-graphite">Choose an amount</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {PRESETS.map((p) => (
            <button
              key={p.amount}
              onClick={() => {
                setSelected(p.amount);
                setCustom('');
              }}
              className={`flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2.5 transition-colors ${
                !custom && selected === p.amount ? 'border-ember bg-ember text-white' : 'border-graphite-dim text-paper hover:border-ember/50'
              }`}
            >
              <span className="text-sm font-semibold">${p.amount}</span>
              <span className={`text-[9.5px] leading-none ${!custom && selected === p.amount ? 'text-white/80' : 'text-graphite'}`}>{p.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-graphite">Or enter a custom amount</label>
          <div className="flex items-center gap-2 rounded-lg border border-graphite-dim px-3 py-2 focus-within:border-ember">
            <span className="text-graphite">$</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-paper outline-none"
            />
          </div>
        </div>

        {error && <p className="mt-3 font-mono text-xs text-ember">{error}</p>}

        <button
          onClick={handleDonate}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Redirecting to Stripe…' : `Donate $${custom || selected}`}
        </button>

        <div className="mt-6 flex justify-center">
          <StripeBadge />
        </div>
      </motion.div>

      <p className="mt-8 text-center text-[13px] italic text-graphite">
        Whatever you can give — thank you. Genuinely.
      </p>
    </main>
  );
}