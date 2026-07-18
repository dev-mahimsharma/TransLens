"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1e-9);
}

interface PositionHeatmapProps {
  labels: string[];
  vectors: number[][];
  cellSize?: number;
}

export function PositionHeatmap({ labels, vectors, cellSize = 40 }: PositionHeatmapProps) {
  const [hovered, setHovered] = useState<{ i: number; j: number } | null>(null);
  const [clicked, setClicked] = useState<{ i: number; j: number } | null>(null);

  const n = labels.length;
  const padding = 64;

  const matrix = useMemo(
    () => vectors.map((v1) => vectors.map((v2) => cosineSim(v1, v2))),
    [vectors]
  );

  const gridSize = n * cellSize;
  const svgSize = gridSize + padding;
  const active = hovered ?? clicked;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full max-w-[560px]">
        {labels.map((label, j) => (
          <text
            key={`col-${j}`}
            x={padding + j * cellSize + cellSize / 2}
            y={padding - 14}
            textAnchor="middle"
            className="fill-graphite font-mono text-[10px]"
          >
            {j}
          </text>
        ))}
        {labels.map((label, i) => (
          <text
            key={`row-${i}`}
            x={padding - 14}
            y={padding + i * cellSize + cellSize / 2 + 3}
            textAnchor="end"
            className="fill-graphite font-mono text-[10px]"
          >
            {i}
          </text>
        ))}

        {matrix.map((row, i) =>
          row.map((sim, j) => {
            const opacity = Math.max(0, sim);
            const isActive = active?.i === i && active?.j === j;
            return (
              <motion.rect
                key={`${i}-${j}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: (i * n + j) * 0.008 }}
                x={padding + j * cellSize}
                y={padding + i * cellSize}
                width={cellSize - 2}
                height={cellSize - 2}
                rx={3}
                fill="var(--signal-cyan)"
                fillOpacity={i === j ? 1 : opacity * 0.85}
                stroke={isActive ? "var(--signal-violet)" : "var(--void)"}
                strokeWidth={isActive ? 2 : 1}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered({ i, j })}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setClicked({ i, j })}
              />
            );
          })
        )}
      </svg>

      {active && (
        <div className="rounded-xl border border-graphite-dim bg-white px-4 py-2.5 text-center shadow-sm">
          <p className="font-mono text-xs text-paper">
            Position {active.i} ({labels[active.i].trim() || "␣"}) ↔ Position {active.j} ({labels[active.j].trim() || "␣"})
          </p>
          <p className="mt-0.5 font-mono text-sm text-signal-cyan">
            {(matrix[active.i][active.j] * 100).toFixed(1)}% similar
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-graphite">Less similar</span>
        <div className="flex h-3 w-32 overflow-hidden rounded-full">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex-1 bg-signal-cyan" style={{ opacity: (i + 1) / 10 }} />
          ))}
        </div>
        <span className="font-mono text-[10px] text-graphite">More similar</span>
      </div>
    </div>
  );
}