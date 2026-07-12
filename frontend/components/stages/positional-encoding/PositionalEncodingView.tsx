"use client";

import { useMemo } from "react";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";

const CELL_SIZE = 34;
const PADDING = 70;

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1e-9);
}

/**
 * Split out from Embeddings so positional encoding gets its own moment
 * rather than being buried inside "combined" vectors. All data here
 * (position_embedding per token) already comes back from the backend's
 * normal /run and /recompute responses -- no new endpoint needed, this
 * is purely a new lens on existing data.
 *
 * The heatmap directly demonstrates the thing worth teaching: even
 * though GPT-2's positional embeddings are just a learned lookup table
 * with no built-in notion of "distance", training tends to make nearby
 * positions end up with similar vectors anyway.
 */
export function PositionalEncodingView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  const depth = usePipelineStore((s) => s.explanationDepth);

  const { tokens, embeddings } = snapshot?.data ?? { tokens: [], embeddings: [] };
  const n = tokens.length;

  const similarityMatrix = useMemo(() => {
    return embeddings.map((e1) =>
      embeddings.map((e2) => cosineSim(e1.position_embedding, e2.position_embedding))
    );
  }, [embeddings]);

  if (!snapshot || n === 0) return null;

  const gridSize = n * CELL_SIZE;
  const svgSize = gridSize + PADDING;

  return (
    <section className="py-10">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-paper">Positional Encoding</h2>
        <p className="mt-2 max-w-lg text-sm text-graphite">
          {STAGE_EXPLANATIONS.positional_encoding[depth]}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full max-w-[480px]">
          {/* Column labels */}
          {tokens.map((t, j) => (
            <text
              key={`col-${j}`}
              x={PADDING + j * CELL_SIZE + CELL_SIZE / 2}
              y={PADDING - 12}
              textAnchor="middle"
              className="fill-graphite font-mono text-[9px]"
            >
              {j}
            </text>
          ))}
          {/* Row labels */}
          {tokens.map((t, i) => (
            <text
              key={`row-${i}`}
              x={PADDING - 12}
              y={PADDING + i * CELL_SIZE + CELL_SIZE / 2 + 3}
              textAnchor="end"
              className="fill-graphite font-mono text-[9px]"
            >
              {i}
            </text>
          ))}
          {/* Heatmap cells */}
          {similarityMatrix.map((row, i) =>
            row.map((sim, j) => {
              // sim ranges roughly -1..1; map to opacity for a cyan fill
              const opacity = Math.max(0, sim);
              return (
                <rect
                  key={`${i}-${j}`}
                  x={PADDING + j * CELL_SIZE}
                  y={PADDING + i * CELL_SIZE}
                  width={CELL_SIZE - 2}
                  height={CELL_SIZE - 2}
                  fill="var(--signal-cyan)"
                  fillOpacity={i === j ? 1 : opacity * 0.85}
                  stroke="var(--void)"
                  strokeWidth={1}
                />
              );
            })
          )}
        </svg>

        <div className="flex-1">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-graphite">
            How to read this
          </p>
          <ul className="space-y-2 text-sm text-graphite">
            <li>• Each cell compares position i (row) to position j (column) — brighter means more similar.</li>
            <li>• The diagonal is always brightest — every position is identical to itself.</li>
            <li>• Look for brightness fading as you move away from the diagonal — that&apos;s nearby positions being more alike than distant ones.</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <button
          onClick={() => setActiveStage("embeddings")}
          className="rounded-full border border-graphite-dim px-5 py-2 font-mono text-xs uppercase tracking-wider text-graphite hover:text-paper"
        >
          ← Back to Embeddings
        </button>
        <button
          onClick={() => setActiveStage("attention")}
          className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90"
        >
          Next: Self-Attention →
        </button>
      </div>
    </section>
  );
}