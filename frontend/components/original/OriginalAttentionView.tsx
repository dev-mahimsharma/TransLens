"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { AttentionMattersSection } from "@/components/stages/attention/AttentionMattersSection";
import { AttentionConceptCards } from "@/components/stages/attention/AttentionConceptCards";
import { AttentionDiagram } from "@/components/stages/attention/AttentionDiagram";
import { AttentionMathBreakdown } from "@/components/stages/attention/AttentionMathBreakdown";
import { AttentionInsightCards } from "@/components/stages/attention/AttentionInsightCards";
import { AttentionSummaryCard } from "@/components/stages/attention/AttentionSummaryCard";

const NUM_LAYERS = 12;
const NUM_HEADS = 12;

/**
 * Full redesign matching the Positional Encoding page's structure and
 * quality bar. Rebuilt from scratch based on the screenshots shared in
 * conversation (the previous version had been custom-styled beyond what
 * was originally built here) -- if there was specific custom behavior in
 * the prior version not visible in those screenshots, share the old file
 * and it can be merged in.
 */
export function OriginalAttentionView() {
  const snapshot = usePipelineStore((s) => s.activeSnapshot());
  const prompt = usePipelineStore((s) => s.prompt);
  const layer = usePipelineStore((s) => s.activeLayer);
  const setLayer = usePipelineStore((s) => s.setActiveLayer);

  const [head, setHead] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "all-heads">("single");
  const [selectedQuery, setSelectedQuery] = useState<number | null>(null);

  const tokens = snapshot?.data.tokens ?? [];

  const pattern = useMemo(() => {
    const layerData = snapshot?.data.attentions.find((l) => l.layer_index === layer);
    const headData = layerData?.heads.find((h) => h.head_index === head);
    return headData?.weights ?? [];
  }, [snapshot, layer, head]);

  const allHeadsPatterns = useMemo(() => {
    const layerData = snapshot?.data.attentions.find((l) => l.layer_index === layer);
    return layerData?.heads ?? [];
  }, [snapshot, layer]);

  if (!snapshot || tokens.length < 2 || pattern.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-graphite-dim">
        <p className="font-mono text-sm text-graphite">Need at least 2 tokens to visualize attention</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <span className="inline-block rounded-full bg-signal-cyan/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-signal-cyan">
          Step 5 of the Transformer Pipeline
        </span>
        <h2 className="mt-4 font-display text-4xl font-semibold text-paper">Self-Attention</h2>
        <p className="mx-auto mt-3 max-w-md text-base text-graphite">
          How every word decides which other words are worth paying attention to.
        </p>
      </motion.div>

      <AttentionMattersSection />
      <AttentionConceptCards />

      <AttentionDiagram
        tokens={tokens}
        pattern={pattern}
        allHeadsPatterns={allHeadsPatterns}
        layer={layer}
        head={head}
        maxLayer={NUM_LAYERS - 1}
        maxHead={NUM_HEADS - 1}
        onLayerChange={(v) => {
          setLayer(v);
          setSelectedQuery(null);
        }}
        onHeadChange={(v) => {
          setHead(v);
          setSelectedQuery(null);
        }}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          setSelectedQuery(null);
        }}
        selectedQuery={selectedQuery}
        onSelectQuery={setSelectedQuery}
      />

      {selectedQuery !== null && (
        <AttentionMathBreakdown prompt={prompt} layer={layer} head={head} queryIndex={selectedQuery} />
      )}

      <AttentionInsightCards />
      <AttentionSummaryCard />
    </div>
  );
}