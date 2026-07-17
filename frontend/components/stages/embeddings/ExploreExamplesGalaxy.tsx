"use client";

import { useEffect, useState } from "react";
import { modelAdapter } from "@/lib/engine/modelAdapter";
import { GALAXY_WORDS, categoryForWord } from "@/lib/content/galaxyWords";
import { EmbeddingGalaxy } from "./EmbeddingGalaxy";

/**
 * Owns the data that used to live inside EmbeddingGalaxy itself before
 * it became a controlled component (see conversation: Original Mode's
 * redesign needed EmbeddingGalaxy to accept real prompt data as props,
 * which meant it could no longer self-fetch). This wrapper is what keeps
 * Custom Mode's "Explore Examples" curated word bank working under the
 * new controlled API -- it fetches once, holds selection state, and
 * passes everything down as props exactly like OriginalEmbeddingsView
 * does for real prompt data.
 */
export function ExploreExamplesGalaxy() {
  const [vectors, setVectors] = useState<number[][] | null>(null);
  const [words, setWords] = useState<{ word: string; color: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    modelAdapter
      .lookupWordEmbeddings(GALAXY_WORDS)
      .then((result) => {
        if (cancelled) return;
        setWords(
          result.embeddings.map((e) => ({
            word: e.word,
            color: categoryForWord(e.word)?.color ?? "#EDEEF2",
          }))
        );
        setVectors(result.embeddings.map((e) => e.embedding));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load the galaxy");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-graphite-dim">
        <p className="font-mono text-sm text-ember">{error}</p>
      </div>
    );
  }

  if (!words || !vectors) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-graphite-dim bg-void-raised">
        <p className="font-mono text-sm text-graphite">Loading the galaxy…</p>
      </div>
    );
  }

  return (
    <EmbeddingGalaxy
      words={words}
      vectors={vectors}
      selectedIndex={selectedIndex}
      hoveredIndex={hoveredIndex}
      onSelect={setSelectedIndex}
      onHover={setHoveredIndex}
    />
  );
}