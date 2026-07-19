"use client";

import { useState } from "react";

interface AttentionDiagramProps {
  tokens: { text: string }[];
  pattern: number[][];
  allHeadsPatterns: { head_index: number; weights: number[][] }[];
  layer: number;
  head: number;
  maxLayer: number;
  maxHead: number;
  onLayerChange: (layer: number) => void;
  onHeadChange: (head: number) => void;
  viewMode: "single" | "all-heads";
  onViewModeChange: (mode: "single" | "all-heads") => void;
  selectedQuery: number | null;
  onSelectQuery: (index: number) => void;
}

const ROW_HEIGHT = 34;
const COL_LEFT_X = 90;
const COL_RIGHT_X = 420;
const TOP_PADDING = 30;

export function AttentionDiagram({
  tokens,
  pattern,
  allHeadsPatterns,
  layer,
  head,
  maxLayer,
  maxHead,
  onLayerChange,
  onHeadChange,
  viewMode,
  onViewModeChange,
  selectedQuery,
  onSelectQuery,
}: AttentionDiagramProps) {
  const [hoveredConnection, setHoveredConnection] = useState<{ q: number; k: number } | null>(null);
  const n = tokens.length;
  const svgHeight = TOP_PADDING * 2 + (n - 1) * ROW_HEIGHT;

  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">See it in action</h3>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-graphite">
        Click a token on the left (the query) to see how much attention it gives to every other token, and open its
        real math breakdown below. Thicker lines and higher percentages mean stronger connections.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <Stepper label="Layer" value={layer} max={maxLayer} onChange={onLayerChange} />
        {viewMode === "single" && <Stepper label="Head" value={head} max={maxHead} onChange={onHeadChange} />}
        <div className="flex items-center rounded-full border border-graphite-dim bg-white p-1 shadow-sm">
          {(["single", "all-heads"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                viewMode === mode ? "bg-signal-cyan text-white" : "text-graphite hover:text-paper"
              }`}
            >
              {mode === "single" ? "Single Head" : "All Heads"}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "single" ? (
        <div className="mt-8 flex justify-center">
          <svg
            viewBox={`0 0 510 ${svgHeight}`}
            className="w-full max-w-[560px] rounded-2xl border border-graphite-dim bg-white p-2 shadow-sm"
          >
            {tokens.map((queryToken, i) => {
              const qy = TOP_PADDING + i * ROW_HEIGHT;
              return (
                <g key={`arcs-${i}`}>
                  {tokens.map((keyToken, j) => {
                    const weight = pattern[i]?.[j] ?? 0;
                    if (weight < 0.02) return null;
                    const ky = TOP_PADDING + j * ROW_HEIGHT;
                    const isHovered = hoveredConnection?.q === i && hoveredConnection?.k === j;
                    const isDimmed =
                      (selectedQuery !== null && selectedQuery !== i) ||
                      (hoveredConnection !== null && hoveredConnection.q !== i);
                    return (
                      <path
                        key={`c-${i}-${j}`}
                        d={`M ${COL_LEFT_X} ${qy} C ${COL_LEFT_X + 140} ${qy}, ${COL_RIGHT_X - 140} ${ky}, ${COL_RIGHT_X} ${ky}`}
                        fill="none"
                        stroke="var(--signal-cyan)"
                        strokeWidth={isHovered ? 3.5 : 0.6 + weight * 3.5}
                        strokeOpacity={isDimmed ? 0.06 : 0.15 + weight * 0.8}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoveredConnection({ q: i, k: j })}
                        onMouseLeave={() => setHoveredConnection(null)}
                      />
                    );
                  })}
                </g>
              );
            })}

            {tokens.map((token, i) => (
              <g key={`q-${i}`} onClick={() => onSelectQuery(i)} style={{ cursor: "pointer" }}>
                <circle
                  cx={COL_LEFT_X}
                  cy={TOP_PADDING + i * ROW_HEIGHT}
                  r={selectedQuery === i ? 6 : 4}
                  fill={selectedQuery === i ? "var(--signal-violet)" : "var(--signal-cyan)"}
                />
                <text
                  x={COL_LEFT_X - 12}
                  y={TOP_PADDING + i * ROW_HEIGHT + 4}
                  textAnchor="end"
                  className="font-mono text-[11px]"
                  style={{ fill: "var(--paper)" }}
                >
                  {token.text.trim() || "␣"}
                </text>
              </g>
            ))}
            {tokens.map((token, j) => (
              <g key={`k-${j}`}>
                <circle cx={COL_RIGHT_X} cy={TOP_PADDING + j * ROW_HEIGHT} r={4} fill="var(--graphite)" />
                <text
                  x={COL_RIGHT_X + 12}
                  y={TOP_PADDING + j * ROW_HEIGHT + 4}
                  className="font-mono text-[11px]"
                  style={{ fill: "var(--paper)" }}
                >
                  {token.text.trim() || "␣"}
                </text>
              </g>
            ))}
          </svg>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {allHeadsPatterns.map((h) => (
            <button
              key={h.head_index}
              onClick={() => {
                onHeadChange(h.head_index);
                onViewModeChange("single");
              }}
              className="rounded-xl border border-graphite-dim bg-white p-2 shadow-sm transition-colors hover:border-signal-cyan"
            >
              <MiniHeatmap weights={h.weights} />
              <p className="mt-1 text-center font-mono text-[10px] text-graphite">Head {h.head_index}</p>
            </button>
          ))}
        </div>
      )}

      {hoveredConnection && viewMode === "single" && (
        <p className="mt-4 text-center font-mono text-xs text-graphite">
          &ldquo;{tokens[hoveredConnection.q].text.trim() || "␣"}&rdquo; → &ldquo;
          {tokens[hoveredConnection.k].text.trim() || "␣"}&rdquo;:{" "}
          <span className="text-signal-cyan">
            {((pattern[hoveredConnection.q]?.[hoveredConnection.k] ?? 0) * 100).toFixed(1)}%
          </span>
        </p>
      )}
    </section>
  );
}

function MiniHeatmap({ weights }: { weights: number[][] }) {
  const n = weights.length;
  const cell = 60 / n;
  return (
    <svg viewBox={`0 0 ${n * cell} ${n * cell}`} className="w-full">
      {weights.map((row, i) =>
        row.map((w, j) => (
          <rect
            key={`${i}-${j}`}
            x={j * cell}
            y={i * cell}
            width={cell}
            height={cell}
            fill="var(--signal-cyan)"
            fillOpacity={w}
          />
        ))
      )}
    </svg>
  );
}

function Stepper({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-graphite-dim bg-white px-4 py-2 shadow-sm">
      <span className="font-mono text-xs uppercase tracking-wider text-graphite">{label}</span>
      <button onClick={() => onChange(Math.max(0, value - 1))} className="font-mono text-signal-cyan hover:opacity-70">
        −
      </button>
      <span className="w-6 text-center font-mono text-sm text-paper">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="font-mono text-signal-cyan hover:opacity-70">
        +
      </button>
    </div>
  );
}