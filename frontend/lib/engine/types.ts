// Mirrors backend/schemas.py exactly. If you change one, change the other --
// this is the single contract between the Next.js frontend and the Python
// model service, so drift here is the most common source of confusing bugs.

export interface TokenInfo {
  index: number;
  id: number;
  text: string;
  raw: string;
}

export interface EmbeddingVector {
  token_index: number;
  token_embedding: number[];
  position_embedding: number[];
  combined: number[];
}

export interface AttentionHead {
  head_index: number;
  weights: number[][]; // [query_pos][key_pos]
}

export interface LayerAttention {
  layer_index: number;
  heads: AttentionHead[];
}

export interface TopKPrediction {
  token_id: number;
  token_text: string;
  probability: number;
  logit: number;
}

export interface PipelineRunResponse {
  prompt: string;
  model: string;
  tokens: TokenInfo[];
  embeddings: EmbeddingVector[];
  hidden_states: number[][][]; // [layer][seq][d_model]
  attentions: LayerAttention[];
  final_logits: number[];
  top_k_predictions: TopKPrediction[];
}

export interface RecomputeResponse {
  prompt: string;
  model: string;
  changed_from_stage: "embeddings" | "attention";
  changed_at: { layer: number; head: number } | null;
  embeddings: EmbeddingVector[];
  hidden_states: number[][][];
  attentions: LayerAttention[];
  final_logits: number[];
  top_k_predictions: TopKPrediction[];
}

export type StageId =
  | "prompt"
  | "tokenization"
  | "embeddings"
  | "positional_encoding"
  | "attention"
  | "feed_forward"
  | "logits"
  | "sampling";

export const STAGE_ORDER: StageId[] = [
  "prompt",
  "tokenization",
  "embeddings",
  "positional_encoding",
  "attention",
  "feed_forward",
  "logits",
  "sampling",
];

export const STAGE_LABELS: Record<StageId, string> = {
  prompt: "Prompt",
  tokenization: "Tokenization",
  embeddings: "Embeddings",
  positional_encoding: "Positional Encoding",
  attention: "Self-Attention",
  feed_forward: "Feed-Forward Network",
  logits: "Logits",
  sampling: "Sampling",
};