"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { TokenInfo } from "@/lib/engine/types";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function EmbeddingSimilarityPlayground({ tokens, vectors }: { tokens: TokenInfo[]; vectors: number[][] }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(Math.min(1, tokens.length - 1));

  const similarity = useMemo(() => cosineSimilarity(vectors[a] ?? [], vectors[b] ?? []), [a, b, vectors]);
  const pct = ((similarity + 1) / 2) * 100; // map [-1, 1] to a 0-100 bar

  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">How close are two of your tokens, really?</h3>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-graphite">
        Pick any two tokens from your actual prompt — this computes real cosine similarity on their real embedding
        vectors, live.
      </p>

      <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <TokenSelect label="Token A" tokens={tokens} value={a} onChange={setA} />
        <span className="font-mono text-graphite">↔</span>
        <TokenSelect label="Token B" tokens={tokens} value={b} onChange={setB} />
      </div>

      <div className="mx-auto mt-8 max-w-md">
        <div className="h-3 overflow-hidden rounded-full bg-void-raised">
          <motion.div className="h-full rounded-full bg-signal-cyan" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
        </div>
        <p className="mt-3 text-center font-mono text-sm text-paper">
          cosine similarity: <span className="text-signal-cyan">{similarity.toFixed(3)}</span>
        </p>
        <p className="mt-1 text-center text-[12px] text-graphite">
          1.0 = identical direction in meaning-space · 0 = unrelated · −1 = opposite
        </p>
      </div>
    </section>
  );
}

function TokenSelect({
  label,
  tokens,
  value,
  onChange,
}: {
  label: string;
  tokens: TokenInfo[];
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <label className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-graphite">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-graphite-dim bg-white px-3 py-2 font-mono text-sm text-paper outline-none focus:border-signal-cyan"
      >
        {tokens.map((t) => (
          <option key={t.index} value={t.index}>
            {t.text.trim() || `(token ${t.index})`}
          </option>
        ))}
      </select>
    </label>
  );
}