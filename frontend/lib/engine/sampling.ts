// Pure math helpers for the Sampling stage. Deliberately separated from
// the component -- these are easy to reason about (and unit test later)
// in isolation from React/rendering concerns.

/**
 * Temperature-scaled softmax. Note this is applied only across the
 * candidate set already returned by the backend (its top-k predictions
 * at temperature=1), not the full ~50k-token vocabulary -- recomputing a
 * full-vocab softmax client-side would require the raw logits for every
 * token AND a way to decode arbitrary new token ids into text, which
 * needs the tokenizer (a backend concern). Reweighting the existing
 * candidates is the right scope for a v1 visualization: it correctly
 * shows how temperature sharpens (low temp) or flattens (high temp) the
 * distribution among the tokens already on screen.
 */
export function softmaxWithTemperature(logits: number[], temperature: number): number[] {
  const t = Math.max(temperature, 0.05); // guard against divide-by-near-zero
  const scaled = logits.map((l) => l / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
}

/** Weighted random pick -- returns the index sampled according to `probs`. */
export function weightedRandomIndex(probs: number[]): number {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i];
    if (r <= cumulative) return i;
  }
  return probs.length - 1; // floating point fallback
}