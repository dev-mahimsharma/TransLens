"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";
import { OriginalNextButton } from "@/components/original/OriginalNavButtons";
import { VectorInspector } from "@/components/stages/embeddings/VectorInspector";
import { EmbeddingEducation } from "@/components/stages/embeddings/EmbeddingEducation";
import { HowToReadGuide } from "@/components/stages/embeddings/HowToReadGuide";
import { MisconceptionsPanel } from "@/components/stages/embeddings/MisconceptionsPanel";

const PremiumEmbeddingGraph = dynamic(
  () => import("@/components/stages/embeddings/PremiumEmbeddingGraph").then((m) => m.PremiumEmbeddingGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-2xl border" style={{ borderColor: "rgba(255,255,255,.08)", background: "#05070D" }}>
        <p className="font-mono text-sm text-graphite">Loading the visualization…</p>
      </div>
    ),
  }
);

/**
 * Original Mode's Embeddings stage. Shows ONLY the real tokens from the
 * user's actual prompt -- the curated word bank stays exclusive to
 * Custom Mode's Explore Examples tab.
 *
 * Layout note: the graph used to share a row with a "how to read this"
 * sidebar, which duplicated the dedicated HowToReadGuide section already
 * below it. That's removed now -- the graph gets the full width it
 * deserves, and the Vector Inspector (when something's selected) sits
 * below it instead of squeezed into a side column.
 */
export function OriginalEmbeddingsView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const depth = usePipelineStore((s) => s.explanationDepth);
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { tokens, embeddings } = snapshot?.data ?? { tokens: [], embeddings: [] };

  const vectors = useMemo(() => embeddings.map((e) => e.combined), [embeddings]);

  if (!snapshot || tokens.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-graphite-dim">
        <p className="font-mono text-sm text-graphite">Need at least 2 tokens to visualize embeddings</p>
      </div>
    );
  }

  return (
    <section className="py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <h2 className="font-display text-2xl text-paper">Embeddings</h2>
        <p className="mt-2 max-w-2xl text-sm text-graphite">
          {STAGE_EXPLANATIONS.embeddings[depth]} Every point below is one of
          your prompt&apos;s actual tokens — nothing here is a stand-in or a
          generic example.
        </p>
      </div>

      <PremiumEmbeddingGraph
        tokens={tokens.map((t) => ({ text: t.text.trim() || "␣", id: t.id }))}
        vectors={vectors}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        revealStagger={220}
      />

      {selectedIndex !== null && (
        <div className="mt-6 max-w-xl">
          <VectorInspector
            tokenText={tokens[selectedIndex].text}
            tokenId={tokens[selectedIndex].id}
            vector={vectors[selectedIndex]}
            allVectors={vectors}
            allTexts={tokens.map((t) => t.text)}
            selectedIndex={selectedIndex}
          />
        </div>
      )}

      <p className="mt-4 font-mono text-xs text-graphite">
        Drag to rotate · scroll to zoom · right-click drag to pan · click a vector to inspect it (click again to deselect) · Reset Camera to return
      </p>

      <HowToReadGuide />
      <EmbeddingEducation />
      <MisconceptionsPanel />

      <div className="mt-12 flex justify-between">
        <button
          onClick={() => setActiveStage("tokenization")}
          className="rounded-full border border-graphite-dim px-5 py-2 font-mono text-xs uppercase tracking-wider text-graphite transition-colors hover:border-graphite hover:text-paper"
        >
          ← Back to Tokenization
        </button>
        <OriginalNextButton stage="positional_encoding" label="Positional Encoding" />
      </div>
    </section>
  );
}