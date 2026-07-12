"use client";

import { useEffect, useState } from "react";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { modelAdapter, type LayerDetailResponse } from "@/lib/engine/modelAdapter";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";

const NUM_LAYERS = 12;

/**
 * Unlike the other stages, this data isn't included in the main pipeline
 * run response -- full FFN activations (3072-dim per token per layer,
 * ×12 layers) would be a huge, mostly-useless payload. Instead this
 * fetches on demand from /api/pipeline/layer_detail for whichever layer
 * is selected, which already does the work of picking out just the
 * top-firing neurons server-side.
 *
 * Shares `activeLayer` with the Attention stage (see store) so moving the
 * layer stepper here also moves it there, and vice versa -- navigating
 * "through the stack" feels like one continuous control, not two.
 */
export function FeedForwardView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const prompt = usePipelineStore((s) => s.prompt);
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  const depth = usePipelineStore((s) => s.explanationDepth);
  const layer = usePipelineStore((s) => s.activeLayer);
  const setLayer = usePipelineStore((s) => s.setActiveLayer);

  const [detail, setDetail] = useState<LayerDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokens = snapshot?.data.tokens ?? [];

  useEffect(() => {
    if (!prompt) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    modelAdapter
      .getLayerDetail(prompt, layer)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load layer detail");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [prompt, layer]);

  if (!snapshot) return null;

  return (
    <section className="py-10">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-paper">Feed-Forward Network</h2>
        <p className="mt-2 max-w-lg text-sm text-graphite">
          {STAGE_EXPLANATIONS.feed_forward[depth]}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 rounded-full border border-graphite-dim bg-void-raised px-4 py-2 w-fit">
          <span className="font-mono text-xs uppercase tracking-wider text-graphite">Layer</span>
          <button
            onClick={() => setLayer(Math.max(0, layer - 1))}
            className="font-mono text-signal-cyan hover:opacity-70"
          >
            −
          </button>
          <span className="w-6 text-center font-mono text-sm text-paper">{layer}</span>
          <button
            onClick={() => setLayer(Math.min(NUM_LAYERS - 1, layer + 1))}
            className="font-mono text-signal-cyan hover:opacity-70"
          >
            +
          </button>
        </div>
      </div>

      {isLoading && (
        <p className="font-mono text-xs text-graphite">Loading neuron activations for layer {layer}…</p>
      )}
      {error && (
        <p className="font-mono text-xs text-ember">{error}</p>
      )}

      {detail && !isLoading && (
        <div className="space-y-5">
          {detail.ffn_activations.map((tokenActivations) => (
            <div key={tokenActivations.token_index}>
              <p className="mb-2 font-mono text-sm text-paper">
                {tokens[tokenActivations.token_index]?.text.trim() || "␣"}
              </p>
              <div className="flex flex-wrap gap-2">
                {tokenActivations.top_neurons.map((neuron) => {
                  // Scale bar width by post-activation magnitude, relative
                  // to the strongest neuron for THIS token specifically.
                  const maxMag = Math.max(
                    ...tokenActivations.top_neurons.map((n) => Math.abs(n.post_activation)),
                    1e-6
                  );
                  const widthPct = (Math.abs(neuron.post_activation) / maxMag) * 100;
                  return (
                    <div
                      key={neuron.neuron_index}
                      className="rounded-lg border border-graphite-dim bg-void-raised px-3 py-2"
                      title={`pre-activation: ${neuron.pre_activation.toFixed(3)}`}
                    >
                      <p className="font-mono text-[10px] text-graphite">#{neuron.neuron_index}</p>
                      <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-void">
                        <div
                          className="h-full rounded-full bg-signal-cyan"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-signal-cyan">
                        {neuron.post_activation.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 flex justify-between">
        <button
          onClick={() => setActiveStage("attention")}
          className="rounded-full border border-graphite-dim px-5 py-2 font-mono text-xs uppercase tracking-wider text-graphite hover:text-paper"
        >
          ← Back to Self-Attention
        </button>
        <button
          onClick={() => setActiveStage("logits")}
          className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90"
        >
          Next: Logits →
        </button>
      </div>
    </section>
  );
}