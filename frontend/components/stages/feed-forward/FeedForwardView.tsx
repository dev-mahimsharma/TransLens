"use client";

import { useEffect, useState, useMemo } from "react";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { modelAdapter, type LayerDetailResponse } from "@/lib/engine/modelAdapter";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";
import { FeedForwardMattersSection } from "./FeedForwardMattersSection";
import { FeedForwardEducationCards } from "./FeedForwardEducationCards";
import { FeedForwardMisconception } from "./FeedForwardMisconception";
import { FeedForwardSummaryCard } from "./FeedForwardSummaryCard";

const NUM_LAYERS = 12;

/**
 * Generates a mock explanation for a neuron based on its index and the token.
 */
function getNeuronExplanation(neuronIndex: number, tokenText: string): string {
  const categories = [
    "detects noun phrases related to",
    "fires strongly when finding punctuation after",
    "recognizes subject-verb agreement associated with",
    "activates for semantic concepts similar to",
    "identifies grammatical boundaries near",
    "looks for adjectives modifying",
    "specializes in syntax structures surrounding"
  ];
  // Deterministic mock selection
  const catIndex = (neuronIndex * tokenText.length) % categories.length;
  return `Neuron #${neuronIndex} ${categories[catIndex]} "${tokenText.trim() || "␣"}".`;
}

export function FeedForwardView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const prompt = usePipelineStore((s) => s.prompt);
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  const layer = usePipelineStore((s) => s.activeLayer);
  const setLayer = usePipelineStore((s) => s.setActiveLayer);
  const learningMode = usePipelineStore((s) => s.learningMode);
  const customTokens = usePipelineStore((s) => s.customTokens);

  const [detail, setDetail] = useState<LayerDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [hoveredNeuron, setHoveredNeuron] = useState<number | null>(null);

  const tokens = snapshot?.data.tokens ?? [];

  useEffect(() => {
    if (!prompt) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    modelAdapter
      .getLayerDetail(prompt, layer, "gpt2", 15, learningMode === "custom" ? customTokens : undefined) // Fetch slightly more top neurons
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
  }, [prompt, layer, learningMode, customTokens]);

  if (!snapshot) return null;

  const currentTokenActivations = useMemo(() => {
    return detail?.ffn_activations.find(a => a.token_index === selectedTokenIndex) || null;
  }, [detail, selectedTokenIndex]);

  const maxMag = useMemo(() => {
    if (!currentTokenActivations) return 1e-6;
    return Math.max(
      ...currentTokenActivations.top_neurons.map((n) => Math.abs(n.post_activation)),
      1e-6
    );
  }, [currentTokenActivations]);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="inline-block rounded-full bg-signal-cyan/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-signal-cyan">
          Step 5 of the Transformer Pipeline
        </span>
        <h2 className="mt-4 font-display text-4xl font-semibold text-paper">Feed-Forward Network</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-graphite">
          {STAGE_EXPLANATIONS.feed_forward}
        </p>
        <p className="mt-4 text-sm text-graphite">
          <strong>How to explore:</strong> Select a token below to watch it travel through this layer&apos;s neural network. Hover over the glowing neurons to see what specific linguistic features they learned to detect!
        </p>
      </div>

      {/* Opening story beat */}
      <div className="mb-4 w-full">
        <FeedForwardMattersSection />
      </div>

      {/* Controls */}
      <div className="mb-12 mt-12 flex w-full flex-wrap items-center justify-center gap-6">
        <div className="flex items-center gap-3 rounded-full border border-graphite-dim bg-void-raised px-4 py-2 shadow-sm">
          <span className="font-mono text-xs uppercase tracking-wider text-graphite">Layer</span>
          <button onClick={() => setLayer(Math.max(0, layer - 1))} className="font-mono text-signal-cyan hover:text-paper transition-colors">−</button>
          <span className="w-6 text-center font-mono text-sm text-paper font-semibold">{layer}</span>
          <button onClick={() => setLayer(Math.min(NUM_LAYERS - 1, layer + 1))} className="font-mono text-signal-cyan hover:text-paper transition-colors">+</button>
        </div>

        {/* Token Selector Pill List */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-graphite-dim scrollbar-track-transparent">
          {tokens.map((t, idx) => (
            <button
              key={idx}
              onClick={() => { setSelectedTokenIndex(idx); setHoveredNeuron(null); }}
              className={`whitespace-nowrap rounded-full px-4 py-2 font-mono text-xs transition-all ${
                selectedTokenIndex === idx
                  ? "bg-signal-cyan text-void font-bold shadow-md transform scale-105"
                  : "bg-void-raised border border-graphite-dim text-graphite hover:text-paper hover:border-graphite"
              }`}
            >
              {t.text.trim() || "␣"}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center my-20 animate-pulse">
          <div className="h-10 w-10 rounded-full border-2 border-signal-cyan border-t-transparent animate-spin mb-4" />
          <p className="font-mono text-xs text-graphite uppercase tracking-wider">Simulating Neural Activations...</p>
        </div>
      )}

      {error && <p className="font-mono text-xs text-ember my-10">{error}</p>}

      {/* Main Visualization Layout */}
      {detail && !isLoading && currentTokenActivations && (
        <>
          <h3 className="mb-8 text-center font-display text-2xl text-paper">Watch a token pass through this layer</h3>

          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">

            {/* Stage 1: Input Vector */}
            <div className="flex flex-col items-center group">
              <p className="font-mono text-[10px] uppercase tracking-wider text-graphite mb-2">Input Vector</p>
              <div className="px-8 py-3 rounded-xl bg-gradient-to-r from-void to-void-raised border border-graphite-dim shadow-inner text-center min-w-[200px]">
                <span className="font-mono text-lg text-signal-cyan font-semibold block mb-1">
                  &ldquo;{tokens[selectedTokenIndex]?.text.trim() || "␣"}&rdquo;
                </span>
                <span className="font-mono text-[10px] text-graphite">Dimensions: 768</span>
              </div>

              {/* Arrow Down */}
              <div className="h-10 w-px bg-gradient-to-b from-graphite-dim to-signal-cyan/50 my-2 relative">
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-signal-cyan/50" />
              </div>
            </div>

            {/* Stage 2: Expansion Layer (Grid of Neurons) */}
            <div className="w-full max-w-4xl p-8 rounded-2xl bg-void-raised border border-graphite-dim shadow-lg relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-void border border-graphite-dim px-4 py-1 rounded-full shadow-sm">
                <span className="font-mono text-[10px] uppercase tracking-wider text-signal-cyan font-bold">Expansion Layer (GELU)</span>
              </div>
              <p className="font-mono text-xs text-graphite text-center mb-6">
                The token expands into a 3072-dimensional space, triggering specialized neurons. Only the most active are shown here.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {currentTokenActivations.top_neurons.map((neuron) => {
                  const isHovered = hoveredNeuron === neuron.neuron_index;
                  const widthPct = (Math.abs(neuron.post_activation) / maxMag) * 100;

                  // Color intensity based on post_activation strength
                  const opacity = Math.max(0.2, widthPct / 100);

                  return (
                    <div
                      key={neuron.neuron_index}
                      onMouseEnter={() => setHoveredNeuron(neuron.neuron_index)}
                      onMouseLeave={() => setHoveredNeuron(null)}
                      className={`relative cursor-pointer flex flex-col items-center justify-end w-14 h-24 rounded-lg border transition-all duration-300 ${
                        isHovered ? "border-signal-cyan bg-signal-cyan/10 scale-110 z-10 shadow-[0_0_15px_rgba(56,189,248,0.4)]" : "border-graphite-dim bg-void"
                      }`}
                    >
                      <span className="font-mono text-[9px] text-graphite absolute top-2">#{neuron.neuron_index}</span>
                      <div className="w-full px-2 flex justify-center pb-2">
                        <div
                          className="w-full rounded-sm bg-signal-cyan transition-all duration-500 ease-out shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                          style={{ height: `${Math.max(4, widthPct)}%`, opacity: opacity }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Tooltip Card inside Expansion Layer */}
              <div className="mt-8 h-24 flex items-center justify-center">
                {hoveredNeuron !== null ? (
                  <div className="bg-void border border-signal-cyan/40 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.15)] animate-in fade-in zoom-in-95 max-w-lg text-center">
                    <p className="font-mono text-[10px] text-signal-cyan uppercase tracking-wider mb-2">What did it learn?</p>
                    <p className="text-sm text-paper leading-snug">
                      {getNeuronExplanation(hoveredNeuron, tokens[selectedTokenIndex]?.text || "")}
                    </p>
                  </div>
                ) : (
                  <p className="font-mono text-xs text-graphite/50 italic animate-pulse">
                    Hover over a neuron to see its semantic job...
                  </p>
                )}
              </div>
            </div>

            {/* Stage 3: Projection Layer */}
            <div className="flex flex-col items-center">
              {/* Arrow Down */}
              <div className="h-10 w-px bg-gradient-to-b from-signal-cyan/50 to-graphite-dim my-2 relative">
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-graphite-dim" />
              </div>

              <p className="font-mono text-[10px] uppercase tracking-wider text-graphite mb-2 mt-2">Projection Layer</p>
              <div className="px-8 py-3 rounded-xl bg-void-raised border border-graphite-dim shadow-sm text-center min-w-[200px]">
                <span className="font-mono text-xs text-paper block mb-1">
                  Compressing back to 768 dims
                </span>
                <span className="font-mono text-[10px] text-graphite">Knowledge Added ✓</span>
              </div>

              {/* Arrow Down */}
              <div className="h-8 w-px bg-graphite-dim my-2 relative">
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-graphite-dim" />
              </div>
            </div>

            {/* Output Vector */}
            <div className="flex flex-col items-center">
              <p className="font-mono text-[10px] uppercase tracking-wider text-graphite mb-2">Updated Token Vector</p>
              <div className="px-8 py-4 rounded-xl bg-black border border-signal-cyan/30 shadow-[0_0_25px_rgba(56,189,248,0.1)] text-center min-w-[200px]">
                <span className="font-mono text-lg text-white font-semibold block mb-1">
                  &ldquo;{tokens[selectedTokenIndex]?.text.trim() || "␣"}&rdquo;
                </span>
                <span className="font-mono text-[10px] text-signal-cyan">Enriched with context</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* New content sections */}
      <div className="w-full">
        <FeedForwardEducationCards />
        <FeedForwardMisconception />
        <FeedForwardSummaryCard />
      </div>

      {/* Navigation */}
      <div className="mt-16 w-full flex justify-between items-center border-t border-graphite-dim pt-8 px-4">
        <button
          onClick={() => setActiveStage("attention")}
          className="rounded-full border border-graphite-dim px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-graphite transition-colors hover:border-graphite hover:text-paper"
        >
          ← Back to Self-Attention
        </button>
        <button
          onClick={() => setActiveStage("logits")}
          className="rounded-full bg-signal-cyan px-6 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-white transition-all hover:bg-blue-600 hover:-translate-y-0.5 shadow-glow-cyan"
        >
          Next: Logits →
        </button>
      </div>
    </section>
  );
}