"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { TokenEditor } from "./TokenEditor";
import { TokenizationMattersSection } from "./TokenizationMattersSection";
import { TokenizationRevealSection } from "./tokenizationRevealSection";
import { TokenBoundaryMap } from "./TokenBoundaryMap";
import { TokenEducationCards } from "./TokenEducationCards";
import { TokenMergePlayground } from "./TokenMergePlayground";
import { TokenSummaryCard } from "./TokenSummaryCard";

/**
 * Redesigned to match PositionalEncodingView's structure: badge + header,
 * then a sequence of focused sections building the story beat by beat.
 * `custom` mode still hands off to TokenEditor untouched — tokenization
 * itself isn't editable in v1, so that path stays minimal.
 */
export function TokenizationView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  const learningMode = usePipelineStore((s) => s.learningMode);
  const router = useRouter();

  if (!snapshot) return null;
  const { tokens } = snapshot.data;

  return (
    <div className="py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <span className="inline-block rounded-full bg-signal-cyan/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-signal-cyan">
          Step 1 of the Transformer Pipeline
        </span>
        <h2 className="mt-4 font-display text-4xl font-semibold text-paper">Tokenization</h2>
        <p className="mx-auto mt-3 max-w-md text-base text-graphite">
          Turning your exact words into the fundamental units a model can actually read.
        </p>
      </motion.div>

      {learningMode === "custom" ? (
        <div className="mt-12">
          <TokenEditor initialTokens={tokens.slice(1).map((token) => token.text)} />
        </div>
      ) : (
        <>
          <TokenizationMattersSection />
          <TokenizationRevealSection tokens={tokens} />
          <TokenBoundaryMap tokens={tokens} />
          <TokenEducationCards />
          <TokenMergePlayground />
          <TokenSummaryCard />

          <div className="mt-12 flex justify-between">
            <button
              onClick={() => router.push("/")}
              className="rounded-full border border-graphite-dim px-5 py-2 font-mono text-xs uppercase tracking-wider text-graphite transition-colors hover:border-graphite hover:text-paper"
            >
              ← Back to Start
            </button>
            <button
              onClick={() => setActiveStage("embeddings")}
              className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            >
              Next: Embeddings →
            </button>
          </div>
        </>
      )}
    </div>
  );
}