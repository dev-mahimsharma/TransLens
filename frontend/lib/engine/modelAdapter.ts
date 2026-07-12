// Single point of contact with the Python model service. Nothing else in
// the frontend should know this URL or these endpoint shapes directly --
// swap backends, add caching, or add retries here without touching any
// component or store logic.

import type { PipelineRunResponse, RecomputeResponse } from "./types";

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
};
