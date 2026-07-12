"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";

// gpt2-small's fixed shape. If you swap in a different model later, pull
// these from the backend response instead of hardcoding -- kept simple
// here since v1 only targets gpt2-small.
const NUM_LAYERS = 12;
const NUM_HEADS = 12;

const ROW_HEIGHT = 36;
const COL_LEFT_X = 90;
const COL_RIGHT_X = 470;
const TOP_PADDING = 30;

/**
 * The hero visualization. Shows one attention head at a time as an arc
 * diagram: query tokens on the left, key tokens on the right, an arc
 * between them whenever the query attends to that key -- arc opacity and
 * thickness both encode the weight, so the overall shape of "what this
 * head is doing" is visible at a glance before you even select anything.
 *
 * Selecting a query token opens an editable breakdown of exactly how its
 * attention is distributed, with sliders per key token. Applying an edit
 * sends the full modified row to the backend's Time Travel endpoint,
 * which recomputes every layer downstream and returns updated results.
 */
export function AttentionView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const editAttention = usePipelineStore((s) => s.editAttention);
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  const isLoading = usePipelineStore((s) => s.isLoading);
  const depth = usePipelineStore((s) => s.explanationDepth);

  const [layer, setLayer] = useState(0);
  const [head, setHead] = useState(0);
  const [selectedQuery, setSelectedQuery] = useState<number | null>(null);
  const [draftWeights, setDraftWeights] = useState<number[] | null>(null);
  const [hoveredQuery, setHoveredQuery] = useState<number | null>(null);

  const tokens = snapshot?.data.tokens ?? [];
  const n = tokens.length;

  const pattern = useMemo(() => {
    const layerData = snapshot?.data.attentions.find((l) => l.layer_index === layer);
    const headData = layerData?.heads.find((h) => h.head_index === head);
    return headData?.weights ?? [];
  }, [snapshot, layer, head]);

  if (!snapshot || n === 0 || pattern.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-graphite-dim">
        <p className="font-mono text-sm text-graphite">No attention data for this layer/head yet</p>
      </div>
    );
  }

  const svgHeight = TOP_PADDING * 2 + (n - 1) * ROW_HEIGHT;

  function selectQuery(i: number) {
    setSelectedQuery(i);
    setDraftWeights([...pattern[i]]);
  }

  function updateDraft(keyIndex: number, value: number) {
    setDraftWeights((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[keyIndex] = value;
      return next;
    });
  }

  async function applyEdit() {
    if (selectedQuery === null || !draftWeights) return;
    // Renormalize so the row sums to 1, clamping any negative values --
    // sliders are 0..1 already but this keeps the invariant explicit and
    // safe even if it drifts.
    const clamped = draftWeights.map((v) => Math.max(0, v));
    const sum = clamped.reduce((a, b) => a + b, 0) || 1;
    const normalized = clamped.map((v) => v / sum);

    const newPattern = pattern.map((row, i) => (i === selectedQuery ? normalized : row));
    await editAttention(layer, head, newPattern);
    setSelectedQuery(null);
    setDraftWeights(null);
  }

  return (
    <section className="py-10">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-paper">Self-Attention</h2>
        <p className="mt-2 max-w-lg text-sm text-graphite">
          {STAGE_EXPLANATIONS.attention[depth]}
        </p>
      </div>

      {/* Layer / Head selectors */}
      <div className="mb-6 flex flex-wrap gap-6">
        <LayerHeadStepper label="Layer" value={layer} max={NUM_LAYERS - 1} onChange={(v) => { setLayer(v); setSelectedQuery(null); }} />
        <LayerHeadStepper label="Head" value={head} max={NUM_HEADS - 1} onChange={(v) => { setHead(v); setSelectedQuery(null); }} />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Arc diagram */}
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
                  const isFuture = j > i; // normally masked to ~0 by causal attention
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

          {/* Query column (left) */}
          {tokens.map((token, i) => (
            <g
              key={`q-${i}`}
              onMouseEnter={() => setHoveredQuery(i)}
              onMouseLeave={() => setHoveredQuery(null)}
              onClick={() => selectQuery(i)}
              style={{ cursor: "pointer" }}
            >
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
                className="fill-paper font-mono text-[11px]"
              >
                {token.text.trim() || "␣"}
              </text>
            </g>
          ))}

          {/* Key column (right) */}
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

        {/* Side panel */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {selectedQuery === null ? (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="mb-3 font-mono text-xs uppercase tracking-wider text-graphite">
                  How to read this
                </p>
                <ul className="space-y-2 text-sm text-graphite">
                  <li>• Layer {layer}, Head {head} of {NUM_LAYERS} layers × {NUM_HEADS} heads.</li>
                  <li>• Click any query token (left) to inspect and edit its attention distribution.</li>
                  <li className="text-ember">• Ember-colored arcs would attend to a future token — normally impossible, but editable here as an experiment.</li>
                </ul>
              </motion.div>
            ) : (
              <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="mb-1 font-mono text-xs uppercase tracking-wider text-graphite">
                  Editing attention from
                </p>
                <p className="mb-4 font-mono text-lg text-signal-violet">
                  &ldquo;{tokens[selectedQuery].text.trim() || "␣"}&rdquo;
                </p>

                <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
                  {tokens.map((keyToken, j) => {
                    const isFuture = j > selectedQuery;
                    const value = draftWeights?.[j] ?? 0;
                    return (
                      <div key={j} className={isFuture ? "opacity-50" : ""}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-mono text-xs text-paper">
                            {keyToken.text.trim() || "␣"} {isFuture && "(future)"}
                          </span>
                          <span className="font-mono text-xs text-signal-cyan">
                            {(value * 100).toFixed(1)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={value}
                          onChange={(e) => updateDraft(j, parseFloat(e.target.value))}
                          className="w-full accent-signal-cyan"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={applyEdit}
                    disabled={isLoading}
                    className="rounded-full bg-signal-violet px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {isLoading ? "Recomputing…" : "Apply & Recompute"}
                  </button>
                  <button
                    onClick={() => { setSelectedQuery(null); setDraftWeights(null); }}
                    className="rounded-full border border-graphite-dim px-5 py-2 font-mono text-xs uppercase tracking-wider text-graphite hover:text-paper"
                  >
                    Cancel
                  </button>
                </div>
                <p className="mt-2 font-mono text-[11px] text-graphite">
                  Weights auto-renormalize to sum to 100% on apply.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <button
          onClick={() => setActiveStage("sampling")}
          className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90"
        >
          Next: Sampling →
        </button>
      </div>
    </section>
  );
}

function LayerHeadStepper({
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
    <div className="flex items-center gap-3 rounded-full border border-graphite-dim bg-void-raised px-4 py-2">
      <span className="font-mono text-xs uppercase tracking-wider text-graphite">{label}</span>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="font-mono text-signal-cyan hover:opacity-70"
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <span className="w-6 text-center font-mono text-sm text-paper">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="font-mono text-signal-cyan hover:opacity-70"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}