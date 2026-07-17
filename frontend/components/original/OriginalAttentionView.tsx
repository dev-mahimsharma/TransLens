"use client";

import { useMemo, useState } from "react";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";
import { AllHeadsGrid, LayerHeadStepper } from "@/components/stages/attention/AttentionView";
import { OriginalNextButton } from "@/components/original/OriginalNavButtons";

const NUM_LAYERS = 12;
const NUM_HEADS = 12;
const ROW_HEIGHT = 36;
const COL_LEFT_X = 90;
const COL_RIGHT_X = 470;
const TOP_PADDING = 30;

/**
 * Original Mode's Attention stage. Reuses AllHeadsGrid and LayerHeadStepper
 * directly from the Custom Mode AttentionView (exported from there) rather
 * than duplicating them -- those two pieces are pure display, nothing
 * about them implies editability. What's NOT reused is the query-click
 * editable slider panel: here, clicking a query token shows a read-only
 * breakdown instead, so you can still explore the distribution without
 * being able to change it.
 */
export function OriginalAttentionView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const layer = usePipelineStore((s) => s.activeLayer);
  const setLayer = usePipelineStore((s) => s.setActiveLayer);

  const [head, setHead] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "all-heads">("single");
  const [selectedQuery, setSelectedQuery] = useState<number | null>(null);
  const [hoveredQuery, setHoveredQuery] = useState<number | null>(null);

  const tokens = snapshot?.data.tokens ?? [];
  const n = tokens.length;

  const pattern = useMemo(() => {
    const layerData = snapshot?.data.attentions.find((l) => l.layer_index === layer);
    const headData = layerData?.heads.find((h) => h.head_index === head);
    return headData?.weights ?? [];
  }, [snapshot, layer, head]);

  const allHeadsPatterns = useMemo(() => {
    const layerData = snapshot?.data.attentions.find((l) => l.layer_index === layer);
    return layerData?.heads ?? [];
  }, [snapshot, layer]);

  if (!snapshot || n === 0 || pattern.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-graphite-dim">
        <p className="font-mono text-sm text-graphite">No attention data for this layer/head yet</p>
      </div>
    );
  }

  const svgHeight = TOP_PADDING * 2 + (n - 1) * ROW_HEIGHT;

  return (
    <section className="py-10">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-paper">Self-Attention</h2>
        <p className="mt-2 max-w-lg text-sm text-graphite">
          {STAGE_EXPLANATIONS.attention}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-6">
        <LayerHeadStepper label="Layer" value={layer} max={NUM_LAYERS - 1} onChange={(v) => { setLayer(v); setSelectedQuery(null); }} />
        {viewMode === "single" && (
          <LayerHeadStepper label="Head" value={head} max={NUM_HEADS - 1} onChange={(v) => { setHead(v); setSelectedQuery(null); }} />
        )}
        <div className="flex items-center rounded-full border border-graphite-dim bg-void-raised p-0.5">
          {(["single", "all-heads"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setViewMode(mode); setSelectedQuery(null); }}
              className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                viewMode === mode ? "bg-signal-cyan text-void" : "text-graphite hover:text-paper"
              }`}
            >
              {mode === "single" ? "Single Head" : "All Heads"}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "all-heads" ? (
        <AllHeadsGrid heads={allHeadsPatterns} tokens={tokens} onSelectHead={(h) => { setHead(h); setViewMode("single"); }} />
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row">
          <svg
            viewBox={`0 0 560 ${svgHeight}`}
            className="w-full max-w-[560px] rounded-2xl border border-graphite-dim bg-void-raised"
          >
            {tokens.map((queryToken, i) => {
              const qy = TOP_PADDING + i * ROW_HEIGHT;
              return (
                <g key={`arcs-${i}`}>
                  {tokens.map((keyToken, j) => {
                    const weight = pattern[i]?.[j] ?? 0;
                    if (weight < 0.02) return null;
                    const ky = TOP_PADDING + j * ROW_HEIGHT;
                    const isDimmed =
                      (hoveredQuery !== null && hoveredQuery !== i) ||
                      (selectedQuery !== null && selectedQuery !== i);
                    const isFuture = j > i;
                    return (
                      <path
                        key={`arc-${i}-${j}`}
                        d={`M ${COL_LEFT_X} ${qy} C ${COL_LEFT_X + 160} ${qy}, ${COL_RIGHT_X - 160} ${ky}, ${COL_RIGHT_X} ${ky}`}
                        fill="none"
                        stroke={isFuture ? "var(--ember)" : "var(--signal-cyan)"}
                        strokeWidth={0.5 + weight * 4}
                        strokeOpacity={isDimmed ? 0.06 : 0.15 + weight * 0.75}
                      />
                    );
                  })}
                </g>
              );
            })}

            {tokens.map((token, i) => (
              <g
                key={`q-${i}`}
                onMouseEnter={() => setHoveredQuery(i)}
                onMouseLeave={() => setHoveredQuery(null)}
                onClick={() => setSelectedQuery(selectedQuery === i ? null : i)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={COL_LEFT_X}
                  cy={TOP_PADDING + i * ROW_HEIGHT}
                  r={selectedQuery === i ? 6 : 4}
                  fill="var(--signal-cyan)"
                  fillOpacity={selectedQuery === i ? 1 : 0.8}
                />
                <text
                  x={COL_LEFT_X - 12}
                  y={TOP_PADDING + i * ROW_HEIGHT + 4}
                  textAnchor="end"
                  className="fill-paper font-mono text-[11px]"
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
                  className="fill-paper font-mono text-[11px]"
                >
                  {token.text.trim() || "␣"}
                </text>
              </g>
            ))}
          </svg>

          <div className="flex-1">
            {selectedQuery === null ? (
              <>
                <p className="mb-3 font-mono text-xs uppercase tracking-wider text-graphite">
                  How to read this
                </p>
                <ul className="space-y-2 text-sm text-graphite">
                  <li>• Layer {layer}, Head {head} of {NUM_LAYERS} layers × {NUM_HEADS} heads.</li>
                  <li>• Click any query token (left) to see exactly how its attention is distributed.</li>
                  <li>• Want to edit these weights? Switch to Custom Mode.</li>
                </ul>
              </>
            ) : (
              <>
                <p className="mb-1 font-mono text-xs uppercase tracking-wider text-graphite">
                  Attention from
                </p>
                <p className="mb-4 font-mono text-lg text-signal-cyan">
                  &ldquo;{tokens[selectedQuery].text.trim() || "␣"}&rdquo;
                </p>
                <div className="max-h-72 space-y-2 overflow-y-auto pr-2">
                  {tokens.map((keyToken, j) => {
                    const weight = pattern[selectedQuery]?.[j] ?? 0;
                    const isFuture = j > selectedQuery;
                    return (
                      <div key={j} className={isFuture ? "opacity-50" : ""}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-mono text-xs text-paper">
                            {keyToken.text.trim() || "␣"} {isFuture && "(future)"}
                          </span>
                          <span className="font-mono text-xs text-signal-cyan">
                            {(weight * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-void">
                          <div className="h-full rounded-full bg-signal-cyan" style={{ width: `${weight * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-end">
        <OriginalNextButton stage="feed_forward" label="Feed-Forward Network" />
      </div>
    </section>
  );
}
