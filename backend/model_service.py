"""
TransLens model service — TransformerLens edition.

This replaces the raw-`transformers` version. TransformerLens
(https://github.com/TransformerLensOrg/TransformerLens) is a library built
specifically for mechanistic interpretability: it wraps real pretrained
models (GPT-2 and many others) and gives you every internal activation
through a single `run_with_cache()` call, plus first-class support for
"activation patching" -- running a forward pass while swapping out any
internal value mid-computation. That second feature is exactly what
Time Travel is, at every stage, including inside attention -- which the
raw-transformers version could not do without a manual reimplementation.

Net effect: less code than the previous version, AND it covers the
Attention-stage Time Travel that was previously scoped as a Phase 2 TODO.

Every value returned uses REAL pretrained GPT-2 weights, so outputs and
attention patterns are meaningful, not random noise.
"""

from __future__ import annotations

import torch
import torch.nn.functional as F
from transformer_lens import HookedTransformer

from schemas import (
    TokenInfo,
    EmbeddingVector,
    AttentionHead,
    LayerAttention,
    TopKPrediction,
    PipelineRunResponse,
    RecomputeResponse,
)

MODEL_REGISTRY = {
    "gpt2": "gpt2",              # 124M, 12 layers, 12 heads, 768 hidden
    "gpt2-small": "gpt2",
    "distilgpt2": "distilgpt2",  # lighter option for local dev
}


class ModelService:
    def __init__(self, model_key: str = "gpt2", device: str | None = None):
        if model_key not in MODEL_REGISTRY:
            raise ValueError(
                f"Unknown model '{model_key}'. Available: {list(MODEL_REGISTRY.keys())}"
            )
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model_key = model_key

        # HookedTransformer.from_pretrained downloads + converts the real
        # HF checkpoint into TransformerLens's instrumented format.
        self.model = HookedTransformer.from_pretrained(
            MODEL_REGISTRY[model_key], device=self.device
        )
        self.model.eval()

        self.hidden_size = self.model.cfg.d_model
        self.num_layers = self.model.cfg.n_layers
        self.num_heads = self.model.cfg.n_heads

    # ---------- Tokenization ----------

    def tokenize(self, prompt: str) -> tuple[list[TokenInfo], torch.Tensor]:
        tokens_tensor = self.model.to_tokens(prompt)  # [1, seq], includes BOS
        str_tokens = self.model.to_str_tokens(prompt)
        ids = tokens_tensor[0].tolist()

        tokens = [
            TokenInfo(index=i, id=ids[i], text=str_tokens[i].strip() or str_tokens[i], raw=str_tokens[i])
            for i in range(len(ids))
        ]
        return tokens, tokens_tensor

    # ---------- Full forward pass ----------

    @torch.no_grad()
    def run_pipeline(self, prompt: str, top_k: int = 10) -> PipelineRunResponse:
        tokens, tokens_tensor = self.tokenize(prompt)
        logits, cache = self.model.run_with_cache(tokens_tensor)

        embeddings = self._extract_embeddings(cache, len(tokens))
        hidden_states = self._extract_hidden_states(cache, len(tokens))
        attentions = self._extract_attentions(cache)
        final_logits = logits[0, -1, :]
        top_k_predictions = self._top_k(final_logits, top_k)

        return PipelineRunResponse(
            prompt=prompt,
            model=self.model_key,
            tokens=tokens,
            embeddings=embeddings,
            hidden_states=hidden_states,
            attentions=attentions,
            final_logits=final_logits.tolist(),
            top_k_predictions=top_k_predictions,
        )

    # ---------- Recompute from modified embeddings (Time Travel) ----------

    @torch.no_grad()
    def recompute_from_embeddings(
        self, prompt: str, overrides: dict[int, list[float]], top_k: int = 10
    ) -> RecomputeResponse:
        tokens, tokens_tensor = self.tokenize(prompt)

        def patch_embed(value, hook):
            # value: [1, seq, d_model] -- the combined (token + pos) input
            # to layer 0. Overwriting it here is equivalent to editing what
            # the user sees in the Embeddings stage.
            for token_index, new_vec in overrides.items():
                if 0 <= token_index < value.shape[1]:
                    value[0, token_index] = torch.tensor(
                        new_vec, dtype=value.dtype, device=value.device
                    )
            return value

        logits, cache = self.model.run_with_cache(
            tokens_tensor,
            fwd_hooks=[("blocks.0.hook_resid_pre", patch_embed)],
        )

        embeddings = self._extract_embeddings(cache, len(tokens), resid_pre_layer0=True)
        hidden_states = self._extract_hidden_states(cache, len(tokens))
        attentions = self._extract_attentions(cache)
        final_logits = logits[0, -1, :]
        top_k_predictions = self._top_k(final_logits, top_k)

        return RecomputeResponse(
            prompt=prompt,
            model=self.model_key,
            changed_from_stage="embeddings",
            changed_at=None,
            embeddings=embeddings,
            hidden_states=hidden_states,
            attentions=attentions,
            final_logits=final_logits.tolist(),
            top_k_predictions=top_k_predictions,
        )

    # ---------- Recompute from modified attention pattern (Time Travel) ----------

    @torch.no_grad()
    def recompute_from_attention(
        self,
        prompt: str,
        layer: int,
        head: int,
        new_pattern: list[list[float]],
        top_k: int = 10,
    ) -> RecomputeResponse:
        if layer < 0 or layer >= self.num_layers:
            raise ValueError(f"layer must be in [0, {self.num_layers})")
        if head < 0 or head >= self.num_heads:
            raise ValueError(f"head must be in [0, {self.num_heads})")

        tokens, tokens_tensor = self.tokenize(prompt)
        hook_name = f"blocks.{layer}.attn.hook_pattern"

        def patch_attention(value, hook):
            # value: [1, num_heads, query_pos, key_pos] -- post-softmax
            # attention weights. We overwrite just the one head the user
            # edited; every other head in this layer, and every other
            # layer, is untouched.
            new_tensor = torch.tensor(
                new_pattern, dtype=value.dtype, device=value.device
            )
            value[0, head] = new_tensor
            return value

        logits, cache = self.model.run_with_cache(
            tokens_tensor,
            fwd_hooks=[(hook_name, patch_attention)],
        )

        embeddings = self._extract_embeddings(cache, len(tokens))
        hidden_states = self._extract_hidden_states(cache, len(tokens))
        attentions = self._extract_attentions(cache)
        final_logits = logits[0, -1, :]
        top_k_predictions = self._top_k(final_logits, top_k)

        return RecomputeResponse(
            prompt=prompt,
            model=self.model_key,
            changed_from_stage="attention",
            changed_at={"layer": layer, "head": head},
            embeddings=embeddings,
            hidden_states=hidden_states,
            attentions=attentions,
            final_logits=final_logits.tolist(),
            top_k_predictions=top_k_predictions,
        )

    # ---------- Shared extraction helpers ----------

    def _extract_embeddings(
        self, cache, seq_len: int, resid_pre_layer0: bool = False
    ) -> list[EmbeddingVector]:
        token_embed = cache["hook_embed"][0]      # [seq, d_model]
        pos_embed = cache["hook_pos_embed"][0]     # [seq, d_model]
        # The combined vector is whatever actually fed layer 0 -- normally
        # token_embed + pos_embed, but after a patch it's the overridden
        # value, which is more honest to report back for a before/after diff.
        combined = cache["blocks.0.hook_resid_pre"][0]

        return [
            EmbeddingVector(
                token_index=i,
                token_embedding=token_embed[i].tolist(),
                position_embedding=pos_embed[i].tolist(),
                combined=combined[i].tolist(),
            )
            for i in range(seq_len)
        ]

    def _extract_hidden_states(self, cache, seq_len: int) -> list[list[list[float]]]:
        # Residual stream after each block, index 0 = input to block 0,
        # index N = output of the final block (pre final layernorm).
        states = [cache["blocks.0.hook_resid_pre"][0].tolist()]
        for layer in range(self.num_layers):
            states.append(cache[f"blocks.{layer}.hook_resid_post"][0].tolist())
        return states

    def _extract_attentions(self, cache) -> list[LayerAttention]:
        result = []
        for layer in range(self.num_layers):
            pattern = cache[f"blocks.{layer}.attn.hook_pattern"][0]  # [heads, q, k]
            heads = [
                AttentionHead(head_index=h, weights=pattern[h].tolist())
                for h in range(pattern.shape[0])
            ]
            result.append(LayerAttention(layer_index=layer, heads=heads))
        return result

    def _top_k(self, logits: torch.Tensor, k: int) -> list[TopKPrediction]:
        probs = F.softmax(logits, dim=-1)
        top_probs, top_ids = torch.topk(probs, k)
        return [
            TopKPrediction(
                token_id=tid,
                token_text=self.model.to_string(torch.tensor([tid])),
                probability=prob,
                logit=logits[tid].item(),
            )
            for prob, tid in zip(top_probs.tolist(), top_ids.tolist())
        ]