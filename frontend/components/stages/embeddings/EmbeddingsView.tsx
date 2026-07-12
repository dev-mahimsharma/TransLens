"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { pca } from "@/lib/engine/Pca";

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
  const editEmbedding = usePipelineStore((s) => s.editEmbedding);
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  const isLoading = usePipelineStore((s) => s.isLoading);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const { tokens, embeddings } = snapshot?.data ?? { tokens: [], embeddings: [] };

  const projection = useMemo(() => {
    if (embeddings.length < 2) return null;
    const vectors = embeddings.map((e) => e.combined);
    return pca(vectors, 2);
  }, [embeddings]);

  const screenPoints = useMemo(() => {
    if (!projection) return [];
    const xs = projection.points.map((p) => p[0]);
    const ys = projection.points.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const plotSize = VIEW_SIZE - PADDING * 2;

    return projection.points.map(([x, y]) => ({
      screenX: PADDING + ((x - minX) / rangeX) * plotSize,
      // flip Y so "up" in data space is up on screen
      screenY: VIEW_SIZE - PADDING - ((y - minY) / rangeY) * plotSize,
      scaleX: plotSize / rangeX,
      scaleY: plotSize / rangeY,
    }));
  }, [projection]);

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
          Each token becomes a 768-number vector — a point in a space where
          nearby meanings sit close together. This view compresses that down
          to 2 dimensions using PCA so you can see it. Drag any point to
          actually edit its vector and watch the prediction change downstream.
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
          </ul>
          {isLoading && (
            <p className="mt-4 font-mono text-xs text-signal-cyan">Recomputing downstream…</p>
          )}
        </div>
      </div>

      <div className="mt-12 flex justify-end">
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