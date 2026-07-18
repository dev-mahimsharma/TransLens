// Single point of contact with the Python model service. Nothing else in
// the frontend should know this URL or these endpoint shapes directly --
// swap backends, add caching, or add retries here without touching any
// component or store logic.

import type { PipelineRunResponse, RecomputeResponse } from "./types";

export interface PredictionSummary {
  token_text: string;
  probability: number;
}

export interface NeuronActivation {
  neuron_index: number;
  pre_activation: number;
  post_activation: number;
}

export interface TokenFFNActivations {
  token_index: number;
  top_neurons: NeuronActivation[];
}

export interface LayerDetailResponse {
  layer: number;
  ffn_activations: TokenFFNActivations[];
}

export interface SubTokenInfo {
  id: number;
  text: string;
}

export interface WordEmbedding {
  word: string;
  embedding: number[];
}

export interface PositionInfo {
  index: number;
  token_text: string;
  vector: number[];
}

const BASE_URL = process.env.NEXT_PUBLIC_MODEL_SERVICE_URL ?? "http://localhost:8000";

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Model service error (${res.status}): ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const modelAdapter = {
  async runPipeline(prompt: string, model = "gpt2", topK = 10): Promise<PipelineRunResponse> {
    return postJSON<PipelineRunResponse>("/api/pipeline/run", {
      prompt,
      model,
      top_k: topK,
    });
  },

  async recomputeFromEmbeddings(
    prompt: string,
    overrides: Record<number, number[]>,
    model = "gpt2",
    topK = 10
  ): Promise<RecomputeResponse> {
    return postJSON<RecomputeResponse>("/api/pipeline/recompute/embeddings", {
      prompt,
      model,
      overrides,
      top_k: topK,
    });
  },

  async recomputeFromAttention(
    prompt: string,
    layer: number,
    head: number,
    newPattern: number[][],
    model = "gpt2",
    topK = 10
  ): Promise<RecomputeResponse> {
    return postJSON<RecomputeResponse>("/api/pipeline/recompute/attention", {
      prompt,
      model,
      layer,
      head,
      new_pattern: newPattern,
      top_k: topK,
    });
  },

  async explainChange(
    prompt: string,
    editDescription: string,
    beforePredictions: PredictionSummary[],
    afterPredictions: PredictionSummary[],
    depth: "beginner" | "developer" = "beginner"
  ): Promise<{ explanation: string }> {
    return postJSON<{ explanation: string }>("/api/explain", {
      prompt,
      edit_description: editDescription,
      before_predictions: beforePredictions,
      after_predictions: afterPredictions,
      depth,
    });
  },

  async getLayerDetail(
    prompt: string,
    layer: number,
    model = "gpt2",
    topKNeurons = 8
  ): Promise<LayerDetailResponse> {
    return postJSON<LayerDetailResponse>("/api/pipeline/layer_detail", {
      prompt,
      model,
      layer,
      top_k_neurons: topKNeurons,
    });
  },

  async runCustomTokens(
    customTokens: string[],
    model = "gpt2",
    topK = 10
  ): Promise<PipelineRunResponse> {
    return postJSON<PipelineRunResponse>("/api/pipeline/run_custom_tokens", {
      custom_tokens: customTokens,
      model,
      top_k: topK,
    });
  },

  async tokenizeText(text: string, model = "gpt2"): Promise<{ sub_tokens: SubTokenInfo[] }> {
    return postJSON<{ sub_tokens: SubTokenInfo[] }>("/api/tokenize", { text, model });
  },

  async lookupWordEmbeddings(words: string[], model = "gpt2"): Promise<{ embeddings: WordEmbedding[] }> {
    return postJSON<{ embeddings: WordEmbedding[] }>("/api/embeddings/lookup", { words, model });
  },

  async getPositionalEncoding(text: string, model = "gpt2"): Promise<{ positions: PositionInfo[] }> {
    return postJSON<{ positions: PositionInfo[] }>("/api/positional_encoding", { text, model });
  },
};