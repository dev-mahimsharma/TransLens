"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { SignalSpine } from "@/components/pipeline/SignalSpine";
import { VisualHistory } from "@/components/pipeline/VisualHistory";
import { BranchSwitcher } from "@/components/pipeline/BranchSwitcher";
import { ExplanationPanel } from "@/components/pipeline/ExplanationPanel";
import { BeforeAfterToggle } from "@/components/pipeline/BeforeAfterToggle";
import { TokenizationView } from "@/components/stages/tokenization/TokenizationView";
import { CustomTokenizationView } from "@/components/stages/tokenization/CustomTokenizationView";
import { EmbeddingView } from "@/components/stages/embeddings/EmbeddingsView";
import { OriginalEmbeddingsView } from "@/components/original/OriginalEmbeddingsView";
import { PositionalEncodingView } from "@/components/stages/positional-encoding/PositionalEncodingView";
import { AttentionView } from "@/components/stages/attention/AttentionView";
import { OriginalAttentionView } from "@/components/original/OriginalAttentionView";
import { FeedForwardView } from "@/components/stages/feed-forward/FeedForwardView";
import { LogitsView } from "@/components/stages/logits/LogitsView";
import { SamplingView } from "@/components/stages/sampling/SamplingView";

export default function PipelinePage() {
  const router = useRouter();
  const hasRun = usePipelineStore((s) => s.rootId !== null);
  const activeStage = usePipelineStore((s) => s.activeStage);
  const prompt = usePipelineStore((s) => s.prompt);
  const learningMode = usePipelineStore((s) => s.learningMode);
  const isLoading = usePipelineStore((s) => s.isLoading);
  const isOriginal = learningMode === "original";

  useEffect(() => {
    // Guard: if someone lands here directly without a prompt run yet,
    // and the pipeline is not currently loading, send them back to start.
    if (!hasRun && !isLoading) router.replace("/");
  }, [hasRun, isLoading, router]);

  if (!hasRun) {
    // Show a loading spinner while the pipeline is being prepared
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4.5rem)]">
        <svg className="animate-spin h-8 w-8 text-signal-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      </div>
    );
  }


  return (
    <main className="min-h-[calc(100vh-4.5rem)] px-5 py-10 sm:px-8 lg:px-12">
      <header className="surface-card mx-auto flex max-w-6xl flex-col gap-5 rounded-2xl bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-graphite">
            {isOriginal ? "Original Model · Active prompt" : "Active prompt"}
          </p>
          <p className="mt-1 text-xl font-medium text-paper">&ldquo;{prompt}&rdquo;</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Before/After only makes sense once edits exist to compare --
              Original Mode never creates any, so the toggle is hidden
              rather than shown-but-permanently-disabled. */}
          {!isOriginal && <BeforeAfterToggle />}
        </div>
      </header>

      <div className="mx-auto max-w-6xl">
        <SignalSpine />
      </div>

      {/* Time Travel history, Branching, and AI Explanations are all
          edit-driven features -- none of them have anything to show in
          Original Mode, since no edits are ever made there. */}
      {!isOriginal && <VisualHistory />}
      {!isOriginal && <BranchSwitcher />}
      {!isOriginal && <ExplanationPanel />}

      <div className="surface-card mx-auto mt-2 max-w-6xl rounded-2xl bg-white px-5 sm:px-8">
        {activeStage === "tokenization" &&
          (isOriginal ? <TokenizationView /> : <CustomTokenizationView />)}
        {activeStage === "embeddings" &&
          (isOriginal ? <OriginalEmbeddingsView /> : <EmbeddingView />)}
        {activeStage === "positional_encoding" && <PositionalEncodingView />}
        {activeStage === "attention" &&
          (isOriginal ? <OriginalAttentionView /> : <AttentionView />)}
        {activeStage === "feed_forward" && <FeedForwardView />}
        {activeStage === "logits" && <LogitsView />}
        {activeStage === "sampling" && <SamplingView />}
        {activeStage === "prompt" && <ComingSoon label="Prompt" />}
      </div>
    </main>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-graphite-dim bg-void-raised">
      <p className="font-mono text-sm text-graphite">{label} stage — next pass</p>
    </div>
  );
}
