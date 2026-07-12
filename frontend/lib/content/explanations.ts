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
  "tokenization" | "embeddings" | "positional_encoding" | "attention" | "feed_forward" | "logits" | "sampling",
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
  positional_encoding: {
    beginner:
      "Without something marking word order, the model would see your sentence as a bag of words with no sequence — 'dog bites man' and 'man bites dog' would look identical. So every position (1st word, 2nd word, ...) gets its own learned pattern of numbers added to the token, which is how the model knows what came before what.",
    developer:
      "GPT-2 uses a learned absolute positional embedding table (max_position_embeddings × d_model, 1024 × 768 for gpt2-small) rather than a fixed sinusoidal function. Each position index has its own trained vector, summed elementwise into the residual stream — nearby positions often end up with similar embeddings simply because gradient descent found that useful, not because it's enforced architecturally.",
  },
  attention: {
    beginner:
      "This is how the model decides what to pay attention to. For every word, it looks at every other word that came before it and decides how relevant each one is — like highlighting the most important parts of a sentence before deciding what comes next.",
    developer:
      "Scaled dot-product attention: softmax(QKᵀ/√d_k)V, computed independently per head then concatenated and projected. Causal masking (upper-triangular −∞ before softmax) enforces that position i only attends to positions ≤ i. gpt2-small: 12 heads/layer × 12 layers, d_head = 64.",
  },
  feed_forward: {
    beginner:
      "After attention finishes mixing information between words, each word passes through its own small 'thinking' step — the same simple calculation applied individually to every token. Some of these internal units light up strongly for specific patterns (like certain topics or grammar), which is part of how the model stores what it learned during training.",
    developer:
      "Position-wise FFN: a 2-layer MLP (d_model → 4×d_model → d_model) with a GELU nonlinearity, applied identically and independently to every token position. gpt2-small: d_mlp = 3072. The intermediate 3072-dim layer is often where interpretability research finds the most identifiable, monosemantic-ish features.",
  },
  logits: {
    beginner:
      "Before the model turns its thinking into probabilities, it produces one raw score per possible next word — these are called logits. A higher score means the model favors that word, but the scores themselves aren't probabilities yet (they can even be negative). The next stage turns them into something you can actually compare.",
    developer:
      "The final residual stream (post final LayerNorm) is projected through the unembedding matrix (tied to the token embedding matrix in gpt2) to produce one logit per vocabulary entry (50,257-dim). Logits are unnormalized — softmax (applied in the Sampling stage) is what turns them into a valid probability distribution.",
  },
  sampling: {
    beginner:
      "The model doesn't pick one fixed next word — it assigns a probability to every possible next word, then rolls the dice according to those odds. Temperature controls how bold that roll is: low temperature almost always picks the most likely word; high temperature is willing to gamble on surprising ones.",
    developer:
      "Final hidden state is projected through the (tied) unembedding matrix to produce logits over the vocabulary. Temperature scales logits before softmax (logits/T) — T→0 approaches argmax/greedy decoding, T>1 flattens the distribution toward uniform. Top-k truncates the candidate set before renormalizing.",
  },
};