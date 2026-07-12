"""
TransLens model service API.

Run locally:
    uvicorn main:app --reload --port 8000

The Next.js frontend (modelAdapter.ts) talks to this service over plain
REST. CORS is open to localhost:3000 for local dev -- lock this down to
your real frontend origin before deploying.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    PipelineRunRequest,
    PipelineRunResponse,
    RecomputeFromEmbeddingsRequest,
    RecomputeFromAttentionRequest,
    RecomputeResponse,
    HealthResponse,
    ExplainRequest,
    ExplainResponse,
    LayerDetailRequest,
    LayerDetailResponse,
)
from model_service import ModelService, MODEL_REGISTRY
from explanation_service import ExplanationService

app = FastAPI(
    title="TransLens Model Service",
    description="Exposes GPT-2 internals (embeddings, attention, logits) for interactive visualization.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # tighten before deploying
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the default model once at startup rather than per-request --
# model loading is the slow part (a few seconds for gpt2-small), inference
# itself is fast. Keyed by model_key so multiple models can be loaded
# lazily and cached if you add model choice later.
_service_cache: dict[str, ModelService] = {}


def get_service(model_key: str) -> ModelService:
    if model_key not in MODEL_REGISTRY:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model '{model_key}'. Available: {list(MODEL_REGISTRY.keys())}",
        )
    if model_key not in _service_cache:
        _service_cache[model_key] = ModelService(model_key=model_key)
    return _service_cache[model_key]


@app.on_event("startup")
def preload_default_model():
    # Preload gpt2 so the first user request isn't slow. Comment this out
    # during early local dev if you want faster server restarts.
    get_service("gpt2")


@app.get("/health", response_model=HealthResponse)
def health():
    svc = _service_cache.get("gpt2")
    return HealthResponse(
        status="ok",
        model_loaded=svc.model_key if svc else "none",
        device=svc.device if svc else "n/a",
    )


@app.post("/api/pipeline/run", response_model=PipelineRunResponse)
def run_pipeline(req: PipelineRunRequest):
    svc = get_service(req.model)
    try:
        return svc.run_pipeline(prompt=req.prompt, top_k=req.top_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pipeline/recompute/embeddings", response_model=RecomputeResponse)
def recompute_from_embeddings(req: RecomputeFromEmbeddingsRequest):
    svc = get_service(req.model)
    try:
        return svc.recompute_from_embeddings(
            prompt=req.prompt, overrides=req.overrides, top_k=req.top_k
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pipeline/recompute/attention", response_model=RecomputeResponse)
def recompute_from_attention(req: RecomputeFromAttentionRequest):
    svc = get_service(req.model)
    try:
        return svc.recompute_from_attention(
            prompt=req.prompt,
            layer=req.layer,
            head=req.head,
            new_pattern=req.new_pattern,
            top_k=req.top_k,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pipeline/layer_detail", response_model=LayerDetailResponse)
def layer_detail(req: LayerDetailRequest):
    svc = get_service(req.model)
    try:
        return svc.get_layer_detail(
            prompt=req.prompt, layer=req.layer, top_k_neurons=req.top_k_neurons
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Lazy-loaded, unlike the gpt2 pipeline service -- not every session uses
# AI Explanations, and Qwen2.5-0.5B is a separate ~1GB download/load, so
# there's no reason to pay that cost on every server startup. First call
# to /api/explain will be slower (model load), everything after is fast.
_explanation_service: ExplanationService | None = None


def get_explanation_service() -> ExplanationService:
    global _explanation_service
    if _explanation_service is None:
        _explanation_service = ExplanationService()
    return _explanation_service


@app.post("/api/explain", response_model=ExplainResponse)
def explain_change(req: ExplainRequest):
    svc = get_explanation_service()
    try:
        explanation = svc.explain(
            prompt=req.prompt,
            edit_description=req.edit_description,
            before=req.before_predictions,
            after=req.after_predictions,
            depth=req.depth,
        )
        return ExplainResponse(explanation=explanation)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))