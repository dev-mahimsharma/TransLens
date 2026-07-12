# TransLens Model Service (Phase 1)

Python/FastAPI service that runs GPT-2 and exposes its internals
(embeddings, per-layer attention, logits) for the TransLens frontend.

## ⚠️ Important: this hasn't been run yet

This code was written and reasoned through carefully against the
`transformers` API, but it was built in a sandboxed environment with no
network access, so it could not be executed or tested against real model
weights here. Before wiring the frontend to it:

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Then sanity-check it:

```bash
curl http://localhost:8000/health

curl -X POST http://localhost:8000/api/pipeline/run \
  -H "Content-Type: application/json" \
  -d '{"prompt": "The cat sat on the", "model": "gpt2", "top_k": 5}'
```

First startup will download GPT-2 small (~500MB) from HuggingFace --
that's the one part that genuinely needs network access on your machine.

If anything errors, the two spots most worth checking first are the
`inputs_embeds` handling in `recompute_from_embeddings` (dtype/device
mismatches are the most common failure mode there) and the attention
tensor shapes in `_attentions_to_list` (should be `[1, num_heads, seq, seq]`
per layer for gpt2).

## What's implemented

- `POST /api/pipeline/run` — full forward pass: tokens, token/position/
  combined embeddings, hidden states per layer, attention weights per
  layer per head, final logits, top-k next-token predictions.
- `POST /api/pipeline/recompute/embeddings` — Time Travel from the
  Embeddings stage. Pass modified embedding vectors for one or more
  tokens, get back the full recomputed downstream pipeline.
- `GET /health`

## What's NOT implemented yet (Phase 2)

Time Travel *from inside* the Attention stage (editing attention weights
mid-layer and recomputing forward) needs a manual per-block forward
reimplementation to get access to Q/K/V before they're combined. See the
`TODO` block at the bottom of `model_service.py` for the recommended
approach — it's scoped intentionally for when the Attention stage UI is
being built, since that instrumentation is useful for the visualization
itself, not just for Time Travel.

## Deployment options

- **Modal** — easiest for this shape of workload (stateless, CPU-bound
  small model, occasional cold starts are fine). Wrap `app` in a Modal
  ASGI app and deploy with `modal deploy`.
- **Railway / Fly.io** — straightforward Dockerized FastAPI deploy, good
  if you want an always-on server instead of serverless cold starts.
- Either way: GPT-2 small runs fine on CPU, no GPU needed for v1.

## Frontend integration

The Next.js `modelAdapter.ts` (per the architecture doc) should be the
only place that knows this service's URL and request/response shapes —
point it at `http://localhost:8000` locally and your deployed URL in
production via an env var, not hardcoded.
