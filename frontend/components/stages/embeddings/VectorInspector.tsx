"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cosineSimilarity, topKNeighbors } from "@/lib/engine/similarity";

const PREVIEW_SAMPLE_SIZE = 32;

interface VectorInspectorProps {
  tokenText: string;
  tokenId: number;
  vector: number[]; // full-dimensional, e.g. 768 for gpt2-small
  allVectors: number[][]; // every token's vector in this prompt, for neighbor calc
  allTexts: string[];
  selectedIndex: number;
}

/**
 * Shows exactly what the spec asked for: token, token id, dimension
 * count, and an "animated preview of ~32 representative values" rather
 * than all 768 -- nobody can meaningfully look at 768 numbers, but 32
 * evenly-sampled ones (not just the first 32, which would all come from
 * the same narrow slice of the vector) gives an honest flavor of "this
 * is a long list of numbers with no individually meaningful entry",
 * which is itself part of the lesson.
 */
export function VectorInspector({
  tokenText,
  tokenId,
  vector,
  allVectors,
  allTexts,
  selectedIndex,
}: VectorInspectorProps) {
  const sample = useMemo(() => {
    const step = vector.length / PREVIEW_SAMPLE_SIZE;
    return Array.from({ length: PREVIEW_SAMPLE_SIZE }, (_, i) => {
      const dimIndex = Math.floor(i * step);
      return { dimIndex, value: vector[dimIndex] };
    });
  }, [vector]);

  const maxAbs = useMemo(() => Math.max(...sample.map((s) => Math.abs(s.value)), 1e-6), [sample]);

  const neighbors = useMemo(() => {
    if (allVectors.length < 2) return [];
    const indices = topKNeighbors(allVectors, selectedIndex, Math.min(3, allVectors.length - 1));
    return indices.map((i) => ({
      text: allTexts[i],
      similarity: cosineSimilarity(vector, allVectors[i]),
    }));
  }, [allVectors, allTexts, selectedIndex, vector]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-graphite-dim bg-void-raised p-5"
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-graphite">Vector Inspector</p>
      <p className="mt-1 font-mono text-lg text-signal-cyan">&ldquo;{tokenText.trim() || "␣"}&rdquo;</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">Token ID</p>
          <p className="font-mono text-sm text-paper">{tokenId}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">Dimensions</p>
          <p className="font-mono text-sm text-paper">{vector.length}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-graphite">
          Representative values ({PREVIEW_SAMPLE_SIZE} of {vector.length} dimensions)
        </p>
        <div className="flex h-16 items-end gap-[2px]">
          {sample.map((s, i) => {
            const heightPct = (Math.abs(s.value) / maxAbs) * 100;
            return (
              <motion.div
                key={s.dimIndex}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(4, heightPct)}%` }}
                transition={{ duration: 0.4, delay: i * 0.01 }}
                title={`dim ${s.dimIndex}: ${s.value.toFixed(3)}`}
                className={`flex-1 rounded-sm ${s.value >= 0 ? "bg-signal-cyan" : "bg-ember"}`}
              />
            );
          })}
        </div>
        <p className="mt-2 font-mono text-[10px] text-graphite">
          No single bar means anything on its own — meaning lives in the pattern across all of them together.
        </p>
      </div>

      {neighbors.length > 0 && (
        <div className="mt-5 border-t border-graphite-dim pt-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-graphite">
            Nearest neighbors in this prompt
          </p>
          <ul className="space-y-1.5">
            {neighbors.map((n, i) => (
              <li key={i} className="flex items-center justify-between font-mono text-xs">
                <span className="text-paper">{n.text.trim() || "␣"}</span>
                <span className="text-signal-cyan">{(n.similarity * 100).toFixed(1)}% similar</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}