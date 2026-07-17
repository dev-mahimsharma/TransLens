// Shared vector math for anything that needs "how similar are these two
// embeddings" or "what are this word's nearest neighbors" -- currently
// used by the Embeddings galaxy, kept separate from pca.ts since this is
// a different (much simpler) piece of math than dimensionality reduction.

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1e-9);
}

/** Returns the indices of the k most similar vectors to vectors[index], excluding itself. */
export function topKNeighbors(vectors: number[][], index: number, k: number): number[] {
  const similarities = vectors.map((v, i) => ({
    i,
    sim: i === index ? -Infinity : cosineSimilarity(vectors[index], v),
  }));
  similarities.sort((a, b) => b.sim - a.sim);
  return similarities.slice(0, k).map((s) => s.i);
}