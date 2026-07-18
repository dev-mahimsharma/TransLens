"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cosineSimilarity, topKNeighbors } from "@/lib/engine/similarity";

const PREVIEW_SAMPLE_SIZE = 32;
const HISTOGRAM_BUCKETS = 12;

interface VectorInspectorProps {
  tokenText: string;
  tokenId: number;
  vector: number[];
  allVectors: number[][];
  allTexts: string[];
  selectedIndex: number;
}

function magnitudeOf(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
}

/**
 * Note on "Magnitude" / "Norm" / "Distance from origin": these are all
 * mathematically the SAME number (the L2 norm of the vector) -- showing
 * three separate rows with the identical value would look like a display
 * bug, not three distinct facts. Merged into one clearly-labeled stat
 * instead of faking three different numbers.
 */
export function VectorInspector({
  tokenText,
  tokenId,
  vector,
  allVectors,
  allTexts,
  selectedIndex,
}: VectorInspectorProps) {
  const [copied, setCopied] = useState(false);
  const [highlightActive, setHighlightActive] = useState(false);

  const sample = useMemo(() => {
    const step = vector.length / PREVIEW_SAMPLE_SIZE;
    return Array.from({ length: PREVIEW_SAMPLE_SIZE }, (_, i) => {
      const dimIndex = Math.floor(i * step);
      return { dimIndex, value: vector[dimIndex] };
    });
  }, [vector]);

  const maxAbs = useMemo(() => Math.max(...sample.map((s) => Math.abs(s.value)), 1e-6), [sample]);

  const magnitude = useMemo(() => magnitudeOf(vector), [vector]);

  // Distribution histogram: bins ALL 768 values (not just the 32-sample
  // preview) by magnitude range, showing the overall SHAPE of the
  // vector's values -- complementary to the per-dimension preview above,
  // not a duplicate of it. Real embeddings typically look roughly
  // bell-curved here, which is itself a useful thing to see.
  const histogram = useMemo(() => {
    const absValues = vector.map((v) => Math.abs(v));
    const max = Math.max(...absValues, 1e-6);
    const buckets = Array(HISTOGRAM_BUCKETS).fill(0);
    for (const v of absValues) {
      const bucket = Math.min(HISTOGRAM_BUCKETS - 1, Math.floor((v / max) * HISTOGRAM_BUCKETS));
      buckets[bucket]++;
    }
    const maxCount = Math.max(...buckets, 1);
    return buckets.map((count) => count / maxCount);
  }, [vector]);

  const neighbors = useMemo(() => {
    if (allVectors.length < 2) return [];
    const indices = topKNeighbors(allVectors, selectedIndex, Math.min(3, allVectors.length - 1));
    return indices.map((i) => ({
      text: allTexts[i],
      similarity: cosineSimilarity(vector, allVectors[i]),
    }));
  }, [allVectors, allTexts, selectedIndex, vector]);

  async function handleCopyVector() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(vector));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in insecure contexts / older browsers --
      // fail quietly rather than showing an alarming error for a
      // non-critical convenience feature.
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-graphite-dim bg-void-raised p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-graphite">Vector Inspector</p>
          <p className="mt-1 font-mono text-lg text-signal-cyan">&ldquo;{tokenText.trim() || "␣"}&rdquo;</p>
        </div>
        <button
          onClick={handleCopyVector}
          className="rounded-lg border border-graphite-dim px-2.5 py-1 text-xs font-medium text-graphite hover:text-paper"
        >
          {copied ? "Copied!" : "Copy Vector"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">Token ID</p>
          <p className="font-mono text-sm text-paper">{tokenId}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">Dimensions</p>
          <p className="font-mono text-sm text-paper">{vector.length}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite" title="L2 norm — also equals distance from the origin">
            Magnitude
          </p>
          <p className="font-mono text-sm text-paper">{magnitude.toFixed(3)}</p>
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

      <div className="mt-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-graphite">
          Value distribution (all {vector.length} dimensions)
        </p>
        <div className="flex h-12 items-end gap-1">
          {histogram.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, h * 100)}%` }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="flex-1 rounded-sm bg-signal-violet"
            />
          ))}
        </div>
        <p className="mt-2 font-mono text-[10px] text-graphite">
          How many dimensions fall into each magnitude range — the overall shape, not any single value.
        </p>
      </div>

      {neighbors.length > 0 && (
        <div className="mt-5 border-t border-graphite-dim pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">
              Nearest neighbors in this prompt
            </p>
            <button
              onClick={() => setHighlightActive((v) => !v)}
              className="font-mono text-[10px] uppercase tracking-wider transition-colors"
              style={{ color: highlightActive ? "var(--signal-violet)" : "var(--graphite)" }}
            >
              {highlightActive ? "Highlighted ✓" : "Highlight Similar"}
            </button>
          </div>
          <ul className="space-y-1.5">
            {neighbors.map((n, i) => (
              <li
                key={i}
                className={`flex items-center justify-between rounded-md px-2 py-1 font-mono text-xs transition-colors ${
                  highlightActive ? "bg-signal-violet/10" : ""
                }`}
              >
                <span className="text-paper">{n.text.trim() || "␣"}</span>
                <span className="text-signal-cyan">{(n.similarity * 100).toFixed(1)}% similar</span>
              </li>
            ))}
          </ul>
          {highlightActive && (
            <p className="mt-2 font-mono text-[10px] text-graphite">
              These are the same tokens currently glowing brighter in the graph above — selecting this token
              already highlights them there.
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}