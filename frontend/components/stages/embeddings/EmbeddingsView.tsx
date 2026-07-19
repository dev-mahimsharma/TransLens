"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { EmbeddingEducation } from "./EmbeddingEducation";
import { HowToReadGuide } from "./HowToReadGuide";
import { MisconceptionsPanel } from "./MisconceptionsPanel";
import { VectorInspector } from "./VectorInspector";

export function EmbeddingView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const setActiveStage = usePipelineStore((s) => s.setActiveStage);
  
  // Safe extraction of graph context states
  const { tokens, embeddings } = snapshot?.data ?? { tokens: [], embeddings: [] };
  const selectedIndex = usePipelineStore((s) => s.selectedTokenIndex) ?? 0;

  if (!snapshot || tokens.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white">
        <p className="font-mono text-sm text-slate-400">Need active prompt tokens to visualize embeddings</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      
      {/* 1. Master Section Heading Banner (Centered) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
      <span className="inline-block rounded-full bg-signal-cyan/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-signal-cyan">
          Step 2 of the Transformer Pipeline
        </span>
        <h2 className="mt-4 font-display text-4xl font-semibold text-paper">Embeddings</h2>
        <p className="mx-auto max-w-xl text-base text-slate-500 leading-relaxed">
          Every point below is one of your prompt's actual tokens — nothing here is a stand-in or a generic example.
        </p>
      </motion.div>

      {/* 2. The 3D Graph Section Block 
          (DO NOT TOUCH GRAPH: Simply leave your original WebGL Graph canvas view invocation intact here) */}
      <section className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        {/* Replace the block below with your exact <YourWebGLGraphComponent /> */}
        <div className="w-full h-[500px] bg-[#030712] flex items-center justify-center text-slate-600 text-xs font-mono">
          [ Original 3D Canvas Graph Layer Left Untouched Here ]
        </div>
      </section>

      {/* 3. Conditional Vector Inspector Grid Layout Area */}
      {embeddings[selectedIndex] && (
        <section className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Vector Matrix Inspection</h3>
            <p className="mx-auto max-w-md text-sm text-slate-400">
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

      <hr className="border-slate-100" />

      {/* 4. Reading Guide Card Wrapper */}
      <HowToReadGuide />

      {/* 5. Core Informational Grid Cards Block */}
      <EmbeddingEducation />

      {/* 6. Myth Debunking panels Block */}
      <MisconceptionsPanel />

      {/* 7. Bottom Navigation Flow Footer (Centered & Retains Original Pathway Buttons) */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-xl rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm space-y-6"
      >
        <div className="space-y-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Embeddings complete</p>
          <p className="text-xs text-slate-400">Ready to see how position data updates these word vectors?</p>
        </div>

        <button
          onClick={() => setActiveStage("positional")}
          className="inline-flex w-full sm:w-auto justify-center items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-700"
        >
          Next: Positional Encoding →
        </button>
      </motion.div>

    </div>
  );
}