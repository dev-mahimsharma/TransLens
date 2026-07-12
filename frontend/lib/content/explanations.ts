// X-Ray Mode content. Two depth levels for v3 (Beginner, Developer) --
// scoped down from the original four-level plan (Beginner/Intermediate/
// Advanced/Developer) because two well-written levels beat four thin
// ones; Intermediate/Advanced can be added here later without changing
// how any component reads this file.

export type ExplanationDepth = "beginner" | "developer";

interface StageExplanation {
  beginner: string;
  developer: string;
}

export const STAGE_EXPLANATIONS: Record<
  "tokenization" | "embeddings" | "attention" | "sampling",
  StageExplanation
> = {
  tokenization: {
    beginner:
      "The model never sees words — it sees numbers. Your prompt gets chopped into small pieces called tokens (often whole words, sometimes just word-fragments), and each piece is looked up in a giant dictionary the model memorized during training.",
    developer:
      "Byte-Pair Encoding (BPE) tokenizer, GPT-2's original 50,257-token vocabulary. Tokenization is a fixed, deterministic lookup — not learned at inference time. Leading spaces are encoded into the token itself (visible in the 'raw' field as a 'Ġ' prefix) rather than treated as separate whitespace tokens.",
  },
  embeddings: {
    beginner:
      "Each token becomes a list of 768 numbers — think of it as a point in a huge space where similar meanings end up near each other. The model also adds a second set of numbers just to mark each token's position in the sentence, since order matters ('dog bites man' ≠ 'man bites dog').",
    developer:
      "Token embedding (learned lookup table, vocab_size × d_model) is summed with a learned positional embedding (max_pos × d_model) to form the residual stream input to block 0. GPT-2 uses learned absolute positional embeddings, not sinusoidal (unlike the original Transformer paper) or rotary (unlike most modern LLMs).",
  },
  attention: {
    beginner:
      "This is how the model decides what to pay attention to. For every word, it looks at every other word that came before it and decides how relevant each one is — like highlighting the most important parts of a sentence before deciding what comes next.",
    developer:
      "Scaled dot-product attention: softmax(QKᵀ/√d_k)V, computed independently per head then concatenated and projected. Causal masking (upper-triangular −∞ before softmax) enforces that position i only attends to positions ≤ i. gpt2-small: 12 heads/layer × 12 layers, d_head = 64.",
  },
  sampling: {
    beginner:
      "The model doesn't pick one fixed next word — it assigns a probability to every possible next word, then rolls the dice according to those odds. Temperature controls how bold that roll is: low temperature almost always picks the most likely word; high temperature is willing to gamble on surprising ones.",
    developer:
      "Final hidden state is projected through the (tied) unembedding matrix to produce logits over the vocabulary. Temperature scales logits before softmax (logits/T) — T→0 approaches argmax/greedy decoding, T>1 flattens the distribution toward uniform. Top-k truncates the candidate set before renormalizing.",
  },
};