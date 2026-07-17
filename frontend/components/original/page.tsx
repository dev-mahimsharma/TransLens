"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { SignalSpine } from "@/components/pipeline/SignalSpine";
import { TokenizationView } from "@/components/stages/tokenization/TokenizationView";
import { OriginalEmbeddingsView } from "@/components/original/OriginalEmbeddingsView";
import { PositionalEncodingView } from "@/components/stages/positional-encoding/PositionalEncodingView";
import { OriginalAttentionView } from "@/components/original/OriginalAttentionView";
import { FeedForwardView } from "@/components/stages/feed-forward/FeedForwardView";
import { LogitsView } from "@/components/stages/logits/LogitsView";
import { SamplingView } from "@/components/stages/sampling/SamplingView";

const EXAMPLE_PROMPT = "The cat sat on the";

/**
 * Original Mode: watch a real GPT-2 work, stage by stage, with zero
 * editing -- no Time Travel, no Branching, no Before/After, no
 * Explanation Panel, since none of those make sense without an edit to
 * explain or compare against. This is a fully self-contained route
 * (prompt entry + navigation combined in one page) so it never has to
 * touch your landing page or navbar -- link to /original from wherever
 * you want a "Watch how it works" entry point, and link to /pipeline
 * (Custom Mode, unchanged) from wherever you want "Experiment yourself".
 *
 * Stage components here are a deliberate mix: Tokenization, Positional
 * Encoding, Feed-Forward, and Logits are reused directly from Custom
 * Mode because they were already view-only. Embeddings and Attention use
 * dedicated Original-only variants (components/original/) with editing
 * stripped out.
 */
export default function OriginalModePage() {
  const [input, setInput] = useState(EXAMPLE_PROMPT);
  const runPipeline = usePipelineStore((s) => s.runPipeline);
  const isLoading = usePipelineStore((s) => s.isLoading);
  const error = usePipelineStore((s) => s.error);
  const hasRun = usePipelineStore((s) => s.rootId !== null);
  const activeStage = usePipelineStore((s) => s.activeStage);
  const prompt = usePipelineStore((s) => s.prompt);

  async function handleEnter() {
    if (!input.trim()) return;
    await runPipeline(input.trim());
  }

  if (!hasRun) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl text-center"
        >
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-cyan">
            Original Mode — watch, don&apos;t touch
          </p>
          <h1 className="mb-6 font-display text-4xl font-medium leading-tight text-paper sm:text-5xl">
            See exactly how a
            <br />
            real LLM thinks.
          </h1>
          <p className="mx-auto mb-12 max-w-md text-graphite">
            Walk through every stage of GPT-2&apos;s inference pipeline as it
            actually runs — no editing, just a clear view of the real thing.
          </p>

          <div className="mx-auto flex max-w-xl items-center gap-3 rounded-full border border-graphite-dim bg-void-raised px-6 py-4 shadow-glow-cyan/0 transition-shadow focus-within:shadow-glow-cyan">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEnter()}
              placeholder="Type a prompt..."
              className="flex-1 bg-transparent font-mono text-sm text-paper outline-none placeholder:text-graphite"
              maxLength={200}
            />
            <button
              onClick={handleEnter}
              disabled={isLoading || !input.trim()}
              className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {isLoading ? "Loading…" : "Enter"}
            </button>
          </div>

          {error && <p className="mt-4 font-mono text-xs text-ember">{error}</p>}

          <p className="mt-6 font-mono text-xs text-graphite">
            gpt2-small · 124M params · 12 layers · 12 heads
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-12">
      <header className="mx-auto flex max-w-5xl items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-graphite">
            Original Mode · Prompt
          </p>
          <p className="mt-1 font-mono text-lg text-paper">&ldquo;{prompt}&rdquo;</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl">
        <SignalSpine />
      </div>

      <div className="mx-auto max-w-5xl">
        {activeStage === "tokenization" && <TokenizationView />}
        {activeStage === "embeddings" && <OriginalEmbeddingsView />}
        {activeStage === "positional_encoding" && <PositionalEncodingView />}
        {activeStage === "attention" && <OriginalAttentionView />}
        {activeStage === "feed_forward" && <FeedForwardView />}
        {activeStage === "logits" && <LogitsView />}
        {activeStage === "sampling" && <SamplingView />}
      </div>
    </main>
  );
}
