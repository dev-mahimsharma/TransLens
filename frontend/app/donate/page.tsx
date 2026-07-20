'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Heart } from 'lucide-react';

const PRESETS = [5, 10, 25, 50, 100];

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
          TransLens runs a real GPT-2 model live for every visitor, which costs real hosting and compute time. Your
          donation goes directly toward keeping the servers running, the live model online, and the site free and
          ad-free for the next student who finds it — not toward anything else.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-card mt-10 rounded-2xl bg-white p-6 sm:p-8">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-graphite">Choose an amount</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setSelected(p);
                setCustom('');
              }}
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                !custom && selected === p ? 'border-ember bg-ember text-white' : 'border-graphite-dim text-paper hover:border-ember/50'
              }`}
            >
              ${p}
            </button>
          ))}
        </div>

        <div className="mt-3">
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

        <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[11px] text-graphite">
          <ShieldCheck className="h-3.5 w-3.5" /> Processed securely by Stripe. We never see or store your card details.
        </p>
      </motion.div>
    </main>
  );
}