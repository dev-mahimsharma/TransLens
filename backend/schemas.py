"""
Pydantic schemas for the TransLens model service.

These define the exact JSON shape the Next.js frontend will send and
receive. Keeping these separate from model_service.py means the API
contract is easy to read/review on its own, and easy to keep in sync
with a TypeScript types file on the frontend later.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


# ---------- Shared building blocks ----------

class TokenInfo(BaseModel):
    index: int
    id: int
    text: str          # human-readable token string (e.g. "Ġthe" -> "the")
    raw: str            # raw token as the tokenizer stores it, useful for debugging


class EmbeddingVector(BaseModel):
    token_index: int
    # Full-dimensional vector (768-dim for gpt2-small). The frontend
    # is responsible for projecting this down to 2D/3D for visualization
    # (e.g. via PCA/UMAP) -- we don't do dimensionality reduction here
    # so the raw data stays available for other uses (e.g. cosine sim).
    token_embedding: List[float]
    position_embedding: List[float]
    combined: List[float]


class AttentionHead(BaseModel):
    head_index: int
    # seq_len x seq_len matrix of attention weights (post-softmax)
    weights: List[List[float]]


class LayerAttention(BaseModel):
    layer_index: int
    heads: List[AttentionHead]


class TopKPrediction(BaseModel):
    token_id: int
    token_text: str
    probability: float
    logit: float


# ---------- Requests ----------

class PipelineRunRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=512)
    model: str = Field(default="gpt2", description="HF model id, small models only for v1")
    top_k: int = Field(default=10, ge=1, le=50, description="how many top predictions to return")


class RecomputeFromEmbeddingsRequest(BaseModel):
    """
    Powers Time Travel from the Embeddings stage: the user has dragged/edited
    one or more token embedding vectors, and we need to re-run the rest of
    the pipeline (all transformer layers -> logits -> sampling) starting
    from those modified embeddings.
    """
    prompt: str = Field(..., min_length=1, max_length=512)
    model: str = Field(default="gpt2")
    # Sparse overrides: only include the token indices the user actually
    # edited. Any token not listed here uses the model's original embedding.
    overrides: dict[int, List[float]] = Field(
        ..., description="token_index -> new combined embedding vector"
    )
    top_k: int = Field(default=10, ge=1, le=50)


class RecomputeFromAttentionRequest(BaseModel):
    """
    Powers Time Travel from inside the Attention stage: the user has edited
    the attention pattern for one head at one layer (e.g. dragged a weight
    so the model attends more/less to a given token), and we re-run
    everything downstream of that point using TransformerLens's hook system.
    """
    prompt: str = Field(..., min_length=1, max_length=512)
    model: str = Field(default="gpt2")
    layer: int = Field(..., ge=0, description="which transformer block")
    head: int = Field(..., ge=0, description="which attention head within that block")
    # seq_len x seq_len replacement attention pattern (post-softmax weights,
    # each row should sum to ~1.0 -- the frontend is responsible for
    # renormalizing after a user drag before sending this).
    new_pattern: List[List[float]]
    top_k: int = Field(default=10, ge=1, le=50)


# ---------- Responses ----------

class PipelineRunResponse(BaseModel):
    prompt: str
    model: str
    tokens: List[TokenInfo]
    embeddings: List[EmbeddingVector]
    # hidden_states[i] is the residual-stream output after layer i
    # (index 0 = input embeddings, index N = output of final layer)
    hidden_states: List[List[List[float]]]
    attentions: List[LayerAttention]
    final_logits: List[float]           # logits for the next-token prediction only
    top_k_predictions: List[TopKPrediction]


class RecomputeResponse(BaseModel):
    """
    Same shape as a normal run, but scoped to what changed so the frontend
    can animate a diff instead of a hard cut. `changed_from_stage` tells the
    frontend which stage to start the ripple animation from; `changed_at`
    gives optional coordinates within that stage (e.g. layer/head for an
    attention edit) so the animation can originate from the exact node the
    user touched.
    """
    prompt: str
    model: str
    changed_from_stage: str            # "embeddings" | "attention"
    changed_at: Optional[dict] = None  # e.g. {"layer": 3, "head": 5}
    embeddings: List[EmbeddingVector]
    hidden_states: List[List[List[float]]]
    attentions: List[LayerAttention]
    final_logits: List[float]
    top_k_predictions: List[TopKPrediction]


class HealthResponse(BaseModel):
    status: str
    model_loaded: str
    device: str


class PredictionSummary(BaseModel):
    token_text: str
    probability: float


class ExplainRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=512)
    edit_description: str = Field(..., description="e.g. 'Edited layer 3, head 5 attention pattern'")
    before_predictions: List[PredictionSummary] = Field(..., max_length=5)
    after_predictions: List[PredictionSummary] = Field(..., max_length=5)
    depth: str = Field(default="beginner", description="'beginner' or 'developer' -- matches X-Ray Mode")


class ExplainResponse(BaseModel):
    explanation: str