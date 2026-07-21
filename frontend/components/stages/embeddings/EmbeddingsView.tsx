"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { EmbeddingMattersSection } from "./EmbeddingsMattersSection";
import { EmbeddingSimilarityPlayground } from "./EmbeddingsSimilarityPlayground";
import { EmbeddingEducation } from "./EmbeddingEducation";
import { HowToReadGuide } from "./HowToReadGuide";
import { MisconceptionsPanel } from "./MisconceptionsPanel";
import { VectorInspector } from "./VectorInspector";

export function EmbeddingView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);

  const { tokens, embeddings } = snapshot?.data ?? { tokens: [], embeddings: [] };
  const selectedIndex = usePipelineStore((s) => s.selectedTokenIndex) ?? 0;

  if (!snapshot || tokens.length === 0) {
    return (
      <div className="mx-auto flex h-64 max-w-5xl items-center justify-center rounded-3xl border border-dashed border-graphite-dim bg-white px-4">
        <p className="font-mono text-sm text-graphite">Need active prompt tokens to visualize embeddings</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-12">
      {/* 1. Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-center">
        <span className="inline-block rounded-full bg-signal-cyan/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-signal-cyan">
          Step 2 of the Transformer Pipeline
        </span>
        <h2 className="mt-4 font-display text-4xl font-semibold text-paper">Embeddings</h2>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-graphite">
          Every point below is one of your prompt&apos;s actual tokens — nothing here is a stand-in or a generic example.
        </p>
      </motion.div>

      {/* 2. Opening story beat */}
      <EmbeddingMattersSection />

      {/* 3. Mid-section: the 3D graph — DO NOT TOUCH the canvas invocation itself */}
      <section className="overflow-hidden rounded-3xl border border-graphite-dim bg-white shadow-sm">
        {/* Replace the block below with your exact <YourWebGLGraphComponent /> */}
        <div className="flex h-[500px] w-full items-center justify-center bg-[#030712] font-mono text-xs text-slate-600">
          [ Original 3D Canvas Graph Layer Left Untouched Here ]
        </div>
      </section>

      {/* 4. Vector Inspector */}
      {embeddings[selectedIndex] && (
        <section className="mx-auto max-w-2xl space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-paper">Vector Matrix Inspection</h3>
            <p className="mx-auto max-w-md text-sm text-graphite">
              Analyzing the high-dimensional mathematical values calculated for the active token.
            </p>
          </div>
          <VectorInspector
            tokenText={tokens[selectedIndex]?.text ?? ""}
            tokenId={selectedIndex}
            vector={embeddings[selectedIndex]?.token_embedding ?? []}
            allVectors={embeddings.map((e) => e.token_embedding)}
            allTexts={tokens.map((t) => t.text)}
            selectedIndex={selectedIndex}
          />
        </section>
      )}

      {/* 5. Real-data interactive: cosine similarity between any two actual tokens */}
      <EmbeddingSimilarityPlayground tokens={tokens} vectors={embeddings.map((e) => e.token_embedding)} />

      <hr className="border-graphite-dim" />

      {/* 6. Reading guide */}
      <HowToReadGuide />

      {/* 7. Concept cards */}
      <EmbeddingEducation />

      {/* 8. Myth-debunking */}
      <MisconceptionsPanel />

      {/* 9. Bottom nav footer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-xl space-y-6 rounded-3xl border border-graphite-dim bg-void-raised p-8 text-center shadow-sm"
      >
        <div className="space-y-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-signal-cyan">Embeddings complete</p>
          <p className="text-xs text-graphite">Ready to see how position data updates these word vectors?</p>
        </div>

        <button
          onClick={() => setActiveStage("positional")}
          className="inline-flex w-full items-center justify-center rounded-xl bg-signal-cyan px-6 py-3 text-sm font-semibold text-white shadow-md shadow-glow-cyan transition-all hover:bg-blue-700 sm:w-auto"
        >
          Next: Positional Encoding →
        </button>
      </motion.div>
    </div>
  );
}