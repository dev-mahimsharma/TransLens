"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { modelAdapter } from "@/lib/engine/modelAdapter";

/**
 * Manually triggered rather than firing automatically after every edit --
 * a 0.5B model on CPU takes a few seconds to generate, and auto-firing on
 * every drag/slider change would mean constant unwanted latency. The
 * button makes it opt-in per edit instead.
 *
 * Only appears once there's a previous snapshot to explain a change
 * against (i.e. after at least one edit) -- explaining "why" only makes
 * sense when something actually changed.
 */
export function ExplanationPanel() {
  const prompt = usePipelineStore((s) => s.prompt);
  const active = usePipelineStore((s) => s.activeSnapshot());
  const previous = usePipelineStore((s) => s.previousSnapshot());

  const [explanation, setExplanation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!active || !previous || !active.origin) return null;

  async function handleExplain() {
    setIsGenerating(true);
    setError(null);
    setExplanation(null);
    try {
      const before = previous!.data.top_k_predictions
        .slice(0, 5)
        .map((p) => ({ token_text: p.token_text, probability: p.probability }));
      const after = active!.data.top_k_predictions
        .slice(0, 5)
        .map((p) => ({ token_text: p.token_text, probability: p.probability }));

      const result = await modelAdapter.explainChange(
        prompt,
        active!.origin!.description,
        before,
        after
      );
      setExplanation(result.explanation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate explanation"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-2xl border border-graphite-dim bg-void-raised p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-graphite">
              AI Explanation
            </p>
            <p className="mt-1 font-mono text-xs text-graphite">
              Ask a small local model why your last edit changed the output.
            </p>
          </div>
          <button
            onClick={handleExplain}
            disabled={isGenerating}
            className="shrink-0 rounded-full bg-signal-cyan px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isGenerating ? "Thinking…" : "Explain This Change"}
          </button>
        </div>

        <AnimatePresence>
          {explanation && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t border-graphite-dim pt-4 text-sm leading-relaxed text-paper"
            >
              {explanation}
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 border-t border-graphite-dim pt-4 font-mono text-xs text-ember"
            >
              {error} — is the backend running and has it loaded the explanation model yet?
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
