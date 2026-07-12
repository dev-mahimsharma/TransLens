"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { SignalSpine } from "@/components/pipeline/SignalSpine";
import { VisualHistory } from "@/components/pipeline/VisualHistory";
import { BranchSwitcher } from "@/components/pipeline/BranchSwitcher";
import { BeforeAfterToggle } from "@/components/pipeline/BeforeAfterToggle";
import { DepthSelector } from "@/components/pipeline/DepthSelector";
import { TokenizationView } from "@/components/stages/tokenization/TokenizationView";
import { EmbeddingsView } from "@/components/stages/embeddings/EmbeddingsView";
import { AttentionView } from "@/components/stages/attention/AttentionView";
import { SamplingView } from "@/components/stages/sampling/SamplingView";

export default function PipelinePage() {
  const router = useRouter();
  const hasRun = usePipelineStore((s) => s.rootId !== null);
  const activeStage = usePipelineStore((s) => s.activeStage);
  const prompt = usePipelineStore((s) => s.prompt);

  useEffect(() => {
    // Guard: if someone lands here directly without a prompt run yet,
    // send them back to start one -- Mission Control needs data to show.
    if (!hasRun) router.replace("/");
  }, [hasRun, router]);

  if (!hasRun) return null;

  return (
    <main className="min-h-screen px-6 py-10 sm:px-12">
      <header className="mx-auto flex max-w-5xl items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-graphite">Prompt</p>
          <p className="mt-1 font-mono text-lg text-paper">&ldquo;{prompt}&rdquo;</p>
        </div>
        <div className="flex items-center gap-3">
          <DepthSelector />
          <BeforeAfterToggle />
        </div>
      </header>

      <div className="mx-auto max-w-5xl">
        <SignalSpine />
      </div>

      <VisualHistory />
      <BranchSwitcher />

      <div className="mx-auto max-w-5xl">
        {activeStage === "tokenization" && <TokenizationView />}
        {activeStage === "embeddings" && <EmbeddingsView />}
        {activeStage === "attention" && <AttentionView />}
        {activeStage === "sampling" && <SamplingView />}
        {activeStage === "prompt" && <ComingSoon label="Prompt" />}
      </div>
    </main>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-graphite-dim">
      <p className="font-mono text-sm text-graphite">{label} stage — next pass</p>
    </div>
  );
}