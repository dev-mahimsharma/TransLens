"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { softmaxWithTemperature, weightedRandomIndex } from "@/lib/engine/sampling";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";

/**
 * Final stage: turns logits into an actual next token. This is where
 * "prediction" becomes "decision" -- the same distribution can produce
 * very different outputs depending on temperature (how sharply the model
 * commits to its top guess) and top-k (how many candidates are even in
 * play). Sampling is genuinely random by design, so re-sampling at the
 * same settings can (and should) give different results sometimes --
 * that's the point, not a bug.
 */
export function SamplingView() {
  const router = useRouter();
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const previous = usePipelineStore((s) => s.previousSnapshot());
  const compareEnabled = usePipelineStore((s) => s.compareEnabled);
  const depth = usePipelineStore((s) => s.explanationDepth);
  const prompt = usePipelineStore((s) => s.prompt);
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);

  const [temperature, setTemperature] = useState(1.0);
  const [topK, setTopK] = useState(6);
  const [sampled, setSampled] = useState<{ text: string; index: number } | null>(null);

  const allPredictions = snapshot?.data.top_k_predictions ?? [];
  const maxTopK = allPredictions.length;

  const visible = useMemo(() => allPredictions.slice(0, topK), [allPredictions, topK]);

  const reweighted = useMemo(
    () => softmaxWithTemperature(visible.map((p) => p.logit), temperature),
    [visible, temperature]
  );

  // Ghost probabilities: the SAME candidate tokens' probability in the
  // previous snapshot, matched by token id -- shows "here's what this
  // token's chances were before your edit" directly behind the current bar.
  const ghostByTokenId = useMemo(() => {
    if (!compareEnabled || !previous) return null;
    const map = new Map<number, number>();
    for (const p of previous.data.top_k_predictions) map.set(p.token_id, p.probability);
    return map;
  }, [compareEnabled, previous]);

  if (!snapshot || allPredictions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-graphite-dim">
        <p className="font-mono text-sm text-graphite">No prediction data available</p>
      </div>
    );
  }

  function handleSample() {
    const idx = weightedRandomIndex(reweighted);
    setSampled({ text: visible[idx].token_text, index: idx });
  }

  function handleStartOver() {
    router.push("/");
  }

  return (
    <section className="py-10">
      <div className="mb-6">
        <h2 className="font-display text-2xl text-paper">Sampling</h2>
        <p className="mt-2 max-w-lg text-sm text-graphite">
          {STAGE_EXPLANATIONS.sampling[depth]}
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-wrap gap-8">
        <div className="w-56">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-graphite">Temperature</span>
            <span className="font-mono text-xs text-signal-cyan">{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={2}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-signal-cyan"
          />
          <p className="mt-1 font-mono text-[10px] text-graphite">
            {temperature < 0.7 ? "sharp — confident, repetitive" : temperature > 1.3 ? "flat — creative, riskier" : "balanced"}
          </p>
        </div>

        <div className="w-56">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-graphite">Top-K</span>
            <span className="font-mono text-xs text-signal-cyan">{topK}</span>
          </div>
          <input
            type="range"
            min={1}
            max={maxTopK}
            step={1}
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="w-full accent-signal-cyan"
          />
          <p className="mt-1 font-mono text-[10px] text-graphite">
            only the top {topK} candidate{topK === 1 ? "" : "s"} can be sampled
          </p>
        </div>
      </div>

      {/* Probability bars */}
      <div className="max-w-xl space-y-2">
        {compareEnabled && ghostByTokenId && (
          <p className="mb-1 font-mono text-[10px] text-graphite">
            Faint bars show probabilities before your last edit
          </p>
        )}
        {visible.map((pred, i) => {
          const ghostProb = ghostByTokenId?.get(pred.token_id) ?? null;
          return (
            <div key={pred.token_id}>
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`font-mono text-sm ${
                    sampled?.index === i ? "text-signal-violet" : "text-paper"
                  }`}
                >
                  {pred.token_text.trim() || "␣"}
                </span>
                <span className="font-mono text-xs text-graphite">
                  {(reweighted[i] * 100).toFixed(1)}%
                  {ghostProb !== null && (
                    <span className="ml-2 text-graphite/60">was {(ghostProb * 100).toFixed(1)}%</span>
                  )}
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-void-raised">
                {ghostProb !== null && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full border border-graphite/50"
                    style={{ width: `${ghostProb * 100}%` }}
                  />
                )}
                <motion.div
                  className={`relative h-full rounded-full ${
                    sampled?.index === i ? "bg-signal-violet" : "bg-signal-cyan"
                  }`}
                  initial={false}
                  animate={{ width: `${reweighted[i] * 100}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sample action + output */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSample}
          className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90"
        >
          Sample Next Token
        </button>
        {sampled && (
          <span className="font-mono text-xs text-graphite">
            sampled — try again, it&apos;s random on purpose
          </span>
        )}
      </div>

      <AnimatePresence>
        {sampled && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 max-w-xl rounded-2xl border border-signal-violet/40 bg-void-raised p-5"
          >
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-graphite">
              Output
            </p>
            <p className="font-mono text-base text-paper">
              {prompt}
              <span className="text-signal-violet">{sampled.text}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex justify-between">
        <button
          onClick={() => setActiveStage("attention")}
          className="rounded-full border border-graphite-dim px-5 py-2 font-mono text-xs uppercase tracking-wider text-graphite hover:text-paper"
        >
          ← Back to Attention
        </button>
        <button
          onClick={handleStartOver}
          className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90"
        >
          Try a New Prompt
        </button>
      </div>
    </section>
  );
}