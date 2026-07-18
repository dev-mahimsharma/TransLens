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
    NeuronActivation,
    TokenFFNActivations,
    LayerDetailResponse,
    SubTokenInfo,
    TokenizeTextResponse,
    WordEmbedding,
    EmbeddingLookupResponse,
    PositionInfo,
    PositionalEncodingResponse,
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

    # ---------- Layer detail: Feed-Forward Network activations ----------

    @torch.no_grad()
    def get_layer_detail(
        self, prompt: str, layer: int, top_k_neurons: int = 8
    ) -> LayerDetailResponse:
        if layer < 0 or layer >= self.num_layers:
            raise ValueError(f"layer must be in [0, {self.num_layers})")

        tokens, tokens_tensor = self.tokenize(prompt)
        _, cache = self.model.run_with_cache(tokens_tensor)

        # hook_post is the value AFTER the activation function (GELU) --
        # what actually flows forward into the next residual add. hook_pre
        # is included too since "how hard did this neuron fire before vs
        # after the nonlinearity" is a genuinely useful thing to show.
        pre = cache[f"blocks.{layer}.mlp.hook_pre"][0]    # [seq, d_mlp]
        post = cache[f"blocks.{layer}.mlp.hook_post"][0]  # [seq, d_mlp]

        activations = []
        for i in range(len(tokens)):
            # Rank neurons by how strongly they fired (post-activation
            # magnitude) for this specific token -- these are the ones
            # worth showing, out of thousands.
            magnitudes = post[i].abs()
            top_indices = torch.topk(magnitudes, min(top_k_neurons, magnitudes.shape[0])).indices
            top_neurons = [
                NeuronActivation(
                    neuron_index=idx.item(),
                    pre_activation=pre[i, idx].item(),
                    post_activation=post[i, idx].item(),
                )
                for idx in top_indices
            ]
            activations.append(TokenFFNActivations(token_index=i, top_neurons=top_neurons))

        return LayerDetailResponse(layer=layer, ffn_activations=activations)

    # ---------- Custom Mode: simulated tokenization ----------

    @torch.no_grad()
    def run_custom_tokens(
        self, custom_tokens: list[str], top_k: int = 10
    ) -> PipelineRunResponse:
        """
        Runs the model on user-defined "tokens" that generally do NOT
        correspond to real vocabulary entries -- e.g. two real tokens
        merged into one, or one real token split in half. There's no
        principled way to get a "real" embedding for text like that, so
        this SIMULATES one: each custom token's text is re-tokenized with
        the real tokenizer to find whatever real sub-tokens it decodes to,
        their real embeddings are averaged into a single vector, and that
        stands in as "the embedding" for this position.

        This is explicitly a simulation for experimentation, not a
        faithful reproduction of GPT-2's real behavior -- averaging
        sub-token embeddings is a reasonable, well-precedented
        approximation (it's what many embedding-merge techniques do), but
        it is NOT what GPT-2 would compute if that string were actually
        in its vocabulary (it isn't, so there's no ground truth to match).

        Position embeddings ARE real -- position i still gets the model's
        actual learned embedding for position i, since that part of the
        architecture is well-defined regardless of what's semantically
        "in" each position.
        """
        n = len(custom_tokens)
        if n == 0:
            raise ValueError("custom_tokens must not be empty")

        combined_embeds = []
        tokens_info = []
        for i, text in enumerate(custom_tokens):
            # add_special_tokens=False is important here: without it, some
            # tokenizer configs (TransformerLens sets add_bos_token on the
            # underlying HF tokenizer for consistency with its own
            # to_tokens()) will silently prepend the <|endoftext|> special
            # token to every encode() call. That phantom token would get
            # averaged into EVERY custom token's simulated embedding,
            # subtly corrupting all of them -- including anything built
            # from a merge, which is why merge results could look wrong
            # even though the merge logic itself was fine.
            ids = self.model.tokenizer.encode(text, add_special_tokens=False) if text else []
            if not ids:
                ids = self.model.tokenizer.encode(" ", add_special_tokens=False)
            id_tensor = torch.tensor(ids, device=self.device)
            sub_embeds = self.model.W_E[id_tensor]  # [num_subtokens, d_model]
            combined = sub_embeds.mean(dim=0)  # the simulation step
            combined_embeds.append(combined)
            tokens_info.append(
                TokenInfo(index=i, id=ids[0], text=text, raw=text)
            )

        combined_embeds_t = torch.stack(combined_embeds)  # [n, d_model]
        pos_embeds = self.model.W_pos[:n]  # [n, d_model] -- real, unmodified
        resid_pre_override = (combined_embeds_t + pos_embeds).unsqueeze(0)  # [1, n, d_model]

        # Dummy input_ids purely to get a forward pass of the right shape
        # started -- their actual values are irrelevant because the hook
        # below completely overwrites the residual stream before layer 0
        # does anything with it.
        dummy_ids = torch.zeros((1, n), dtype=torch.long, device=self.device)

        def override_resid_pre(value, hook):
            return resid_pre_override

        logits, cache = self.model.run_with_cache(
            dummy_ids, fwd_hooks=[("blocks.0.hook_resid_pre", override_resid_pre)]
        )

        embeddings = [
            EmbeddingVector(
                token_index=i,
                token_embedding=combined_embeds_t[i].tolist(),
                position_embedding=pos_embeds[i].tolist(),
                combined=(combined_embeds_t[i] + pos_embeds[i]).tolist(),
            )
            for i in range(n)
        ]
        hidden_states = self._extract_hidden_states(cache, n)
        attentions = self._extract_attentions(cache)
        final_logits = logits[0, -1, :]
        top_k_predictions = self._top_k(final_logits, top_k)

        return PipelineRunResponse(
            prompt=" ".join(custom_tokens),
            model=self.model_key,
            tokens=tokens_info,
            embeddings=embeddings,
            hidden_states=hidden_states,
            attentions=attentions,
            final_logits=final_logits.tolist(),
            top_k_predictions=top_k_predictions,
        )

    # ---------- Lightweight tokenize-only (no forward pass) ----------

    def tokenize_text(self, text: str) -> TokenizeTextResponse:
        """
        Used by the "View real ID" button: shows exactly what the real
        tokenizer does with a piece of text, with no model computation
        involved. Cheap and fast on purpose -- this can be called on
        every click without worrying about load.
        """
        ids = self.model.tokenizer.encode(text, add_special_tokens=False) if text else []
        if not ids:
            ids = self.model.tokenizer.encode(" ", add_special_tokens=False)
        sub_tokens = [
            SubTokenInfo(id=tid, text=self.model.tokenizer.decode([tid]))
            for tid in ids
        ]
        return TokenizeTextResponse(sub_tokens=sub_tokens)

    def lookup_word_embeddings(self, words: list[str]) -> EmbeddingLookupResponse:
        """
        For the "Explore Examples" galaxy: real GPT-2 token embeddings for
        a curated, fixed word list, decontextualized (no position, no
        forward pass -- just the raw learned embedding for whichever real
        token(s) the word's first sub-token maps to). If a word decodes
        to multiple real sub-tokens, only the first is used -- this is a
        demo of embedding-space clustering, not a claim about what the
        model would do with that exact multi-token word in context.
        """
        results = []
        for word in words:
            ids = self.model.tokenizer.encode(word, add_special_tokens=False)
            if not ids:
                continue
            vec = self.model.W_E[ids[0]]
            results.append(WordEmbedding(word=word, embedding=vec.tolist()))
        return EmbeddingLookupResponse(embeddings=results)

    def get_positional_encoding(self, text: str) -> PositionalEncodingResponse:
        ids = self.model.tokenizer.encode(text, add_special_tokens=False) if text else []
        if not ids:
            ids = self.model.tokenizer.encode(" ", add_special_tokens=False)
        n = len(ids)
        pos_embeds = self.model.W_pos[:n]
        texts = [self.model.tokenizer.decode([tid]) for tid in ids]
        positions = [
            PositionInfo(index=i, token_text=texts[i], vector=pos_embeds[i].tolist())
            for i in range(n)
        ]
        return PositionalEncodingResponse(positions=positions)

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