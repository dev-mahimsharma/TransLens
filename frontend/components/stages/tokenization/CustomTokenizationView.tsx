"use client";

import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { STAGE_EXPLANATIONS } from "@/lib/content/explanations";
import { TokenEditor } from "./TokenEditor";

/**
 * Custom Mode's version of the Tokenization stage. Original Mode uses the
 * plain read-only TokenizationView; this wraps TokenEditor instead,
 * seeding it with the REAL tokens from whatever run got us here (the
 * landing page always does one real run first, regardless of mode -- see
 * runPipeline) as the starting point for editing.
 *
 * TokenEditor itself doesn't know where initialTokens comes from or what
 * happens when you hit Continue -- this component is that connective
 * tissue: real snapshot data in, runCustomPipeline() call out.
 */
export function CustomTokenizationView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());

  const initialTokens = snapshot?.data.tokens.map((t) => t.text) ?? [];

  if (!snapshot) return null;

  return (
    <section className="py-10">
      <div className="mb-8">
        <h2 className="font-display text-2xl text-paper">Tokenization</h2>
        <p className="mt-2 max-w-lg text-sm text-graphite">
          {STAGE_EXPLANATIONS.tokenization} In Custom Mode, you can
          split, merge, reorder, or rewrite these tokens yourself and see
          how the change ripples through the rest of the pipeline.
        </p>
      </div>

      <TokenEditor initialTokens={initialTokens} />
    </section>
  );
}
