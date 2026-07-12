"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { pca } from "@/lib/engine/Pca";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";

const VIEW_SIZE = 560;
const PADDING = 60;

/**
 * Embeddings deep-dive. Real 768-dim vectors are projected to 2D with PCA
 * (see lib/engine/pca.ts) purely for visualization -- but dragging a point
 * doesn't just move a dot cosmetically. The drag delta is mapped back
 * through the same PCA directions into a real edit on the token's actual
 * 768-dim embedding, which is sent to the backend's Time Travel endpoint
 * and recomputes everything downstream. What you see IS what you're
 * editing, just viewed through a 2D window onto a much higher-dim space.
 */
export function EmbeddingsView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const previous = usePipelineStore((s) => s.previousSnapshot());
  const compareEnabled = usePipelineStore((s) => s.compareEnabled);
  const editEmbedding = usePipelineStore((s) => s.editEmbedding);
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  const isLoading = usePipelineStore((s) => s.isLoading);
  const depth = usePipelineStore((s) => s.explanationDepth);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const { tokens, embeddings } = snapshot?.data ?? { tokens: [], embeddings: [] };

  const projection = useMemo(() => {
    if (embeddings.length < 2) return null;
    const vectors = embeddings.map((e) => e.combined);
    return pca(vectors, 2);
  }, [embeddings]);

  const layout = useMemo(() => {
    if (!projection) return null;
    const xs = projection.points.map((p) => p[0]);
    const ys = projection.points.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return {
      minX,
      minY,
      rangeX: maxX - minX || 1,
      rangeY: maxY - minY || 1,
      plotSize: VIEW_SIZE - PADDING * 2,
    };
  }, [projection]);

  function toScreen(x: number, y: number) {
    if (!layout) return { screenX: 0, screenY: 0 };
    return {
      screenX: PADDING + ((x - layout.minX) / layout.rangeX) * layout.plotSize,
      screenY: VIEW_SIZE - PADDING - ((y - layout.minY) / layout.rangeY) * layout.plotSize,
    };
  }

  const screenPoints = useMemo(() => {
    if (!projection || !layout) return [];
    return projection.points.map(([x, y]) => ({
      ...toScreen(x, y),
      scaleX: layout.plotSize / layout.rangeX,
      scaleY: layout.plotSize / layout.rangeY,
    }));
  }, [projection, layout]);

  // Ghost points: previous snapshot's embeddings, projected through the
  // CURRENT snapshot's PCA basis (not their own fresh PCA) -- this is
  // essential, otherwise the two projections would use different
  // rotations and a "before" position would be meaningless to compare
  // against "after". Projecting onto the same axes keeps the comparison honest.
  const ghostScreenPoints = useMemo(() => {
    if (!compareEnabled || !previous || !projection || !layout) return null;
    return previous.data.embeddings.map((e) => {
      const centered = e.combined.map((v, j) => v - projection.mean[j]);
      const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
      const x = dot(centered, projection.componentDirections[0] ?? []);
      const y = dot(centered, projection.componentDirections[1] ?? []);
      return toScreen(x, y);
    });
  }, [compareEnabled, previous, projection, layout]);

  if (!snapshot || !projection) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-graphite-dim">
        <p className="font-mono text-sm text-graphite">Need at least 2 tokens to project embeddings</p>
      </div>
    );
  }

  async function handleDragEnd(tokenIndex: number, offsetX: number, offsetY: number) {
    setDragging(null);
    const point = screenPoints[tokenIndex];
    const dir = projection!.componentDirections;
    const dataDeltaX = offsetX / point.scaleX;
    const dataDeltaY = -offsetY / point.scaleY; // undo the Y flip

    const original = embeddings[tokenIndex].combined;
    const newVector = original.map(
      (val, j) => val + dataDeltaX * (dir[0]?.[j] ?? 0) + dataDeltaY * (dir[1]?.[j] ?? 0)
    );
    await editEmbedding(tokenIndex, newVector);
  }

  return (
    <section className="py-10">
      <div className="mb-8">
        <h2 className="font-display text-2xl text-paper">Embeddings</h2>
        <p className="mt-2 max-w-lg text-sm text-graphite">
          {STAGE_EXPLANATIONS.embeddings[depth]}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <svg
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          className="w-full max-w-[560px] rounded-2xl border border-graphite-dim bg-void-raised"
        >
          {/* Axis guides */}
          <line x1={PADDING} y1={VIEW_SIZE / 2} x2={VIEW_SIZE - PADDING} y2={VIEW_SIZE / 2} stroke="var(--graphite-dim)" strokeWidth={1} />
          <line x1={VIEW_SIZE / 2} y1={PADDING} x2={VIEW_SIZE / 2} y2={VIEW_SIZE - PADDING} stroke="var(--graphite-dim)" strokeWidth={1} />
          <text x={VIEW_SIZE - PADDING} y={VIEW_SIZE / 2 - 8} textAnchor="end" className="fill-graphite font-mono text-[10px]">
            PC1
          </text>
          <text x={VIEW_SIZE / 2 + 8} y={PADDING + 4} className="fill-graphite font-mono text-[10px]">
            PC2
          </text>

          {/* Ghost trail: previous position -> current position */}
          {ghostScreenPoints &&
            tokens.map((token, i) => {
              const from = ghostScreenPoints[i];
              const to = screenPoints[i];
              if (!from || !to) return null;
              return (
                <g key={`ghost-${token.index}`}>
                  <line
                    x1={from.screenX}
                    y1={from.screenY}
                    x2={to.screenX}
                    y2={to.screenY}
                    stroke="var(--graphite)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <circle cx={from.screenX} cy={from.screenY} r={4} fill="none" stroke="var(--graphite)" strokeWidth={1.5} />
                </g>
              );
            })}

          {tokens.map((token, i) => {
            const pt = screenPoints[i];
            if (!pt) return null;
            const isActive = hovered === i || dragging === i;
            return (
              <g key={token.index}>
                <motion.circle
                  cx={pt.screenX}
                  cy={pt.screenY}
                  r={isActive ? 9 : 6}
                  fill={dragging === i ? "var(--signal-violet)" : "var(--signal-cyan)"}
                  style={{ cursor: "grab" }}
                  drag
                  dragMomentum={false}
                  onDragStart={() => setDragging(i)}
                  onDragEnd={(_, info) => handleDragEnd(i, info.offset.x, info.offset.y)}
                  onHoverStart={() => setHovered(i)}
                  onHoverEnd={() => setHovered(null)}
                  animate={{
                    opacity: isLoading && dragging === i ? 0.5 : 1,
                  }}
                  whileTap={{ cursor: "grabbing" }}
                />
                <text
                  x={pt.screenX}
                  y={pt.screenY - 14}
                  textAnchor="middle"
                  className="pointer-events-none fill-paper font-mono text-[11px]"
                >
                  {token.text.trim() || "␣"}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex-1">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-graphite">
            How to read this
          </p>
          <ul className="space-y-2 text-sm text-graphite">
            <li>• Each dot is one token, projected from 768 dimensions down to 2.</li>
            <li>• Distance between dots roughly reflects how differently the model represents them at this stage.</li>
            <li>• Drag a dot and release — the real 768-dim vector is edited along the same directions you see, and the whole downstream pipeline recomputes.</li>
            <li className="text-signal-violet">• Violet means you edited it. Cyan means it&apos;s the model&apos;s original value.</li>
            {compareEnabled && ghostScreenPoints && (
              <li className="text-graphite">• Dashed lines and hollow circles show each token&apos;s position before your last edit.</li>
            )}
          </ul>
          {isLoading && (
            <p className="mt-4 font-mono text-xs text-signal-cyan">Recomputing downstream…</p>
          )}
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <button
          onClick={() => setActiveStage("positional_encoding")}
          className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90"
        >
          Next: Positional Encoding →
        </button>
      </div>
    </section>
  );
}