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
 * Original Mode's Attention stage. Enhancements added for novice-friendly explanations.
 */
export function OriginalAttentionView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const layer = usePipelineStore((s) => s.activeLayer);
  const setLayer = usePipelineStore((s) => s.setActiveLayer);

  const [head, setHead] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "all-heads">("single");
  const [selectedQuery, setSelectedQuery] = useState<number | null>(null);
  const [selectedKey, setSelectedKey] = useState<number | null>(null); // <-- new state for right‑hand token
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
    <section className="py-10 flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="mb-10 text-center flex flex-col items-center">
        <h2 className="font-display text-3xl text-paper">Self-Attention</h2>
        <p className="mt-4 max-w-2xl text-base text-graphite leading-relaxed">
          {STAGE_EXPLANATIONS.attention}
        </p>
<p className="mt-4 text-sm text-graphite">
  <strong>How to explore:</strong> Click a token on the left side (the query) to see how much attention it gives to every other token. Click a token on the right side (the key) to see which queries are looking at it. Thicker curved lines and higher percentages mean stronger connections.
</p>
      </div>

      <div className="mb-12 flex flex-wrap items-center justify-center gap-6">
        <LayerHeadStepper label="Layer" value={layer} max={NUM_LAYERS - 1} onChange={(v) => { setLayer(v); setSelectedQuery(null); }} />
        {viewMode === "single" && (
          <LayerHeadStepper label="Head" value={head} max={NUM_HEADS - 1} onChange={(v) => { setHead(v); setSelectedQuery(null); }} />
        )}
        <div className="flex items-center rounded-full border border-graphite-dim bg-void-raised p-0.5 shadow-sm">
          {(["single", "all-heads"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setViewMode(mode); setSelectedQuery(null); }}
              className={`rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
                viewMode === mode ? "bg-signal-cyan text-void shadow-sm" : "text-graphite hover:text-paper"
              }`}
            >
              {mode === "single" ? "Single Head" : "All Heads"}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "all-heads" ? (
        <div className="w-full">
          <AllHeadsGrid heads={allHeadsPatterns} tokens={tokens} onSelectHead={(h) => { setHead(h); setViewMode("single"); }} />
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          {/* Centered Bipartite Graph */}
          <div className="w-full flex justify-center mb-4">
            <svg
              viewBox={`0 0 560 ${svgHeight}`}
              className="w-full max-w-[560px] rounded-2xl border border-graphite-dim bg-void-raised shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              style={{ maxHeight: '600px', height: 'auto' }}
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
                      
                      const isActive = selectedQuery === i;
                      
                      return (
                        <g key={`arc-group-${i}-${j}`}>
                          <path
                            d={`M ${COL_LEFT_X} ${qy} C ${COL_LEFT_X + 160} ${qy}, ${COL_RIGHT_X - 160} ${ky}, ${COL_RIGHT_X} ${ky}`}
                            fill="none"
                            stroke={isFuture ? "var(--ember)" : "var(--signal-cyan)"}
                            strokeWidth={0.5 + weight * 4}
                            strokeOpacity={isDimmed ? 0.05 : 0.2 + weight * 0.8}
                            className="transition-opacity duration-300"
                          />
                          {isActive && weight > 0.05 && (
                            <text
                              x={(COL_LEFT_X + COL_RIGHT_X) / 2}
                              y={(qy + ky) / 2 - 6}
                              textAnchor="middle"
                              className="fill-signal-cyan font-mono text-[9px] font-medium"
                            >
                              {(weight * 100).toFixed(0)}%
                            </text>
                          )}
                        </g>
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
                  className="transition-transform hover:scale-[1.02]"
                >
                  <circle
                    cx={COL_LEFT_X}
                    cy={TOP_PADDING + i * ROW_HEIGHT}
                    r={selectedQuery === i ? 6 : 4}
                    fill="var(--signal-cyan)"
                    fillOpacity={selectedQuery === i ? 1 : 0.8}
                    className="transition-all"
                  />
                  <text
                    x={COL_LEFT_X - 16}
                    y={TOP_PADDING + i * ROW_HEIGHT + 4}
                    textAnchor="end"
                    className={`font-mono text-[12px] transition-colors ${selectedQuery === i ? "fill-signal-cyan font-semibold" : "fill-paper"}`}
                  >
                    {token.text.trim() || "␣"}
                  </text>
                </g>
              ))}

              {tokens.map((token, j) => (
                <g key={`k-${j}`}>
                  <circle 
                    cx={COL_RIGHT_X} 
                    cy={TOP_PADDING + j * ROW_HEIGHT} 
                    r={4} 
                    fill="var(--graphite)" 
                  />
                  <text
                    x={COL_RIGHT_X + 16}
                    y={TOP_PADDING + j * ROW_HEIGHT + 4}
                    className={`font-mono text-[12px] transition-colors ${selectedQuery !== null && pattern[selectedQuery]?.[j] > 0.05 ? "fill-paper" : "fill-graphite"}`}
                  >
                    {token.text.trim() || "␣"}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          
          <p className="font-mono text-[10px] text-graphite italic mb-6">
            Click any token on the left to see its attention math breakdown.
          </p>

          {/* Attention Math Visualizer Grid */}
          {selectedQuery !== null && (
            <div className="w-full max-w-3xl mt-4 p-8 bg-void-raised border border-graphite-dim rounded-2xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 shadow-sm">
              <h3 className="text-signal-cyan font-mono text-sm uppercase tracking-wider mb-6 border-b border-signal-cyan/20 pb-2">
                Attention Math for &ldquo;{tokens[selectedQuery].text.trim() || "␣"}&rdquo;
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-center mb-8">
                <div className="p-4 rounded-xl bg-black/20 border border-graphite-dim/50 shadow-inner">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-graphite mb-2">Query Vector (Q)</p>
                  <p className="text-sm text-paper">"What am I looking for?"</p>
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-graphite-dim/50 shadow-inner">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-graphite mb-2">Key Vector (K)</p>
                  <p className="text-sm text-paper">"What do I contain?"</p>
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-graphite-dim/50 shadow-inner">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-graphite mb-2">Value Vector (V)</p>
                  <p className="text-sm text-paper">"What data do I pass on?"</p>
                </div>
              </div>

              <div className="w-full space-y-1">
                <div className="flex justify-between border-b border-graphite-dim pb-2 mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-graphite">Dot Product (Q × K)</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-graphite">Attention Score (Softmax)</span>
                </div>
                
                {tokens.map((kToken, j) => {
                  const weight = pattern[selectedQuery]?.[j] ?? 0;
                  const isFuture = j > selectedQuery;
                  if (weight < 0.01 && !isFuture) return null;
                  
                  return (
                    <div key={j} className={`flex justify-between items-center py-2 border-b border-graphite-dim/20 ${isFuture ? "opacity-30" : ""}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-graphite w-6 text-right">{j}.</span>
                        <span className="font-mono text-sm text-paper">&ldquo;{kToken.text.trim() || "␣"}&rdquo;</span>
                        {isFuture && <span className="font-mono text-[9px] uppercase text-ember border border-ember/20 px-1 rounded">Future</span>}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-1.5 rounded-full bg-black/30 overflow-hidden">
                          <div className="h-full rounded-full bg-signal-cyan transition-all" style={{ width: `${weight * 100}%` }} />
                        </div>
                        <span className="font-mono text-xs text-signal-cyan w-12 text-right">
                          {(weight * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-16 w-full flex justify-between items-center border-t border-graphite-dim pt-8">
        <button
          onClick={() => usePipelineStore.getState().setActiveStage("positional_encoding")}
          className="rounded-full border border-graphite-dim px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-graphite transition-colors hover:border-graphite hover:text-paper"
        >
          ← Back to Positional Encoding
        </button>
        <OriginalNextButton stage="feed_forward" label="Feed-Forward Network" />
      </div>
    </section>
  );
}
