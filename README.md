# TransLens

**Step inside a real language model and watch it think.**

TransLens is an interactive platform where, instead of typing a prompt and getting an instant answer, you travel through the complete inference pipeline of a real, running GPT-2 and watch — and edit — every internal step: tokenization, embeddings, positional encoding, attention, the feed-forward network, logits, and sampling.

This document is the single source of truth for what's been built, how it's architected, and how every piece connects to every other piece.

---

## 1. Status at a Glance

| Version | Theme | Status |
|---|---|---|
| **v1** | Core pipeline (5 stages) + Time Travel | ✅ Complete |
| **v2** | Visual History, Before/After, Branching | ✅ Complete |
| **v3** | AI Explanations | ✅ Complete |
| **v4** | Positional Encoding, Logits, Feed-Forward Network, All-Heads view, Layer Navigator | ✅ Complete |
| **v5** | Model choice, deployment hardening | ⏭️ Intentionally not built — see §12 |

**Why stop at v4:** GPT-2's architecture (tokenization → embeddings → positional encoding → self-attention → feed-forward → logits → sampling) is the same backbone almost every modern LLM still uses. Once someone deeply understands GPT-2's pipeline, they understand the shape of the thing — swapping in a bigger or newer model wouldn't teach a fundamentally new concept, just add scale. v5 was about model choice and infrastructure polish, not new learning value.

**Important — this has not been run end-to-end.** Everything was built in a sandboxed environment with no network access, so no file here has actually been executed against real model weights. Code was written carefully against known library APIs (TransformerLens, FastAPI, Next.js), and every file was syntax/structure-checked, but real bugs may surface the first time you actually run it. Treat this as a strong first draft, not a guarantee.

---

## 2. Architecture Overview

TransLens is two independent applications that only ever talk to each other over plain HTTP:

```
translens/
├── backend/     Python — FastAPI + TransformerLens + a small local LLM
└── frontend/    Next.js/TypeScript — everything you see and interact with
```

**Why separate, not one app:** different languages/runtimes (Python for the model, Node for the UI), different deploy targets (the backend needs a server that holds a model in memory; the frontend can deploy anywhere static/edge-friendly), and a clean boundary — the *only* connection between them is one file, `frontend/lib/engine/modelAdapter.ts`, which is the sole place that knows the backend's URL and endpoint shapes. Nothing else in the frontend talks to the backend directly.

```
 ┌─────────────────────┐        HTTP/JSON        ┌──────────────────────────┐
 │   Next.js Frontend   │ ───────────────────────▶│   Python Backend          │
 │                      │                         │                          │
 │  Zustand store       │◀─────────────────────── │  FastAPI routes          │
 │  (snapshot tree)      │                         │  ├─ ModelService          │
 │                      │                         │  │  (TransformerLens,     │
 │  8 stage components  │                         │  │   real GPT-2 weights)  │
 │  (Tokenization ...    │                         │  └─ ExplanationService    │
 │   Sampling)           │                         │     (Qwen2.5-0.5B,       │
 └─────────────────────┘                         │      self-hosted, free)  │
                                                    └──────────────────────────┘
```

---

## 3. Tech Stack

**Backend:**
- **FastAPI** — the HTTP layer
- **TransformerLens** — wraps real GPT-2 and exposes every internal activation through one call (`run_with_cache`), plus native support for "activation patching" (editing an internal value mid-forward-pass and recomputing downstream) — this is what powers Time Travel
- **PyTorch** — underlying tensor math
- **Qwen2.5-0.5B-Instruct** — a second, separate, genuinely open-source (Apache 2.0) instruction-tuned model, self-hosted, used only for AI Explanations

**Frontend:**
- **Next.js 15 / React / TypeScript**
- **Zustand** — global state (the snapshot tree that powers Time Travel/Branching)
- **Framer Motion** — all animation
- **Tailwind CSS** — styling, driven by the design tokens in §8
- **React Three Fiber / Three.js** — installed for future 3D visualization use (not currently load-bearing for any built stage — the Embeddings stage uses 2D SVG, not 3D)

---

## 4. Full Folder Structure

```
translens/
├── backend/
│   ├── main.py                 FastAPI app — every HTTP route lives here
│   ├── model_service.py        Wraps GPT-2 via TransformerLens: full runs,
│   │                           Time Travel (embeddings + attention),
│   │                           layer detail (FFN neurons)
│   ├── explanation_service.py  Wraps Qwen2.5-0.5B-Instruct for AI Explanations
│   ├── schemas.py               Every request/response shape (Pydantic) —
│   │                           the backend half of the frontend/backend contract
│   ├── requirements.txt
│   └── README.md               Backend-specific setup notes
│
└── frontend/
    ├── app/
    │   ├── layout.tsx           Root layout, font loading
    │   ├── page.tsx              Landing page — prompt input, starts a run
    │   ├── globals.css           Design tokens as CSS variables
    │   └── pipeline/
    │       └── page.tsx          Mission Control — renders whichever stage
    │                            is active, plus the Signal Spine, Visual
    │                            History, Branch Switcher, Before/After
    │                            toggle, Depth Selector, Explanation Panel
    │
    ├── components/
    │   ├── pipeline/             Cross-stage UI (not specific to one stage)
    │   │   ├── SignalSpine.tsx        Main nav — the glowing trace
    │   │   ├── VisualHistory.tsx      Path-through-the-tree scrubber
    │   │   ├── BranchSwitcher.tsx     Jump between forked experiments
    │   │   ├── BeforeAfterToggle.tsx  Enables ghost-comparison mode
    │   │   └── ExplanationPanel.tsx   "Explain This Change" (AI Explanations)
    │   │
    │   └── stages/               One folder per pipeline stage
    │       ├── tokenization/TokenizationView.tsx
    │       ├── embeddings/EmbeddingsView.tsx
    │       ├── positional-encoding/PositionalEncodingView.tsx
    │       ├── attention/AttentionView.tsx
    │       ├── feed-forward/FeedForwardView.tsx
    │       ├── logits/LogitsView.tsx
    │       └── sampling/SamplingView.tsx
    │
    ├── lib/
    │   ├── store/
    │   │   └── usePipelineStore.ts   THE core of the app — see §7
    │   ├── engine/
    │   │   ├── types.ts               TS types mirroring backend schemas.py
    │   │   ├── modelAdapter.ts        The ONLY file that calls the backend
    │   │   ├── pca.ts                 Dual-space PCA for the Embeddings view
    │   │   └── sampling.ts            Temperature softmax + weighted sampling
    │   ├── content/
    │   │   └── explanations.ts        Shared stage descriptions
    │   └── utils.ts                   cn() classname helper
    │
    ├── package.json / tailwind.config.ts / tsconfig.json / next.config.js
    └── .env.local.example              NEXT_PUBLIC_MODEL_SERVICE_URL
```

---

## 5. The Pipeline, Stage by Stage

The pipeline is 8 stages, walked in this order. Each stage's "Next" button hands off to the one after it; each stage reads from the same underlying snapshot (see §7), so nothing is recomputed just to move between stages — moving stages is instant, only *editing* something triggers a real backend recompute.

1. **Prompt** (`app/page.tsx`) — the landing page. Pre-filled with an example so the first interaction doesn't require typing. Submitting calls `runPipeline()`, which hits `/api/pipeline/run` and creates the root snapshot.

2. **Tokenization** — shows how your prompt was chopped into tokens and mapped to ids. Click a token to see its raw tokenizer form (BPE artifacts like leading-space encoding). Not editable — token identity changing would mean a different prompt entirely, not a Time Travel edit.

3. **Embeddings** — every token's 768-dim vector, projected to 2D via PCA (computed client-side, `lib/engine/pca.ts`) so it's visualizable. **Draggable**: moving a point maps the 2D drag back through the same PCA directions into a real edit on the 768-dim vector, sent to `/api/pipeline/recompute/embeddings`.

4. **Positional Encoding** — a cosine-similarity heatmap between every pair of position vectors. No new data needed (position vectors already come back from the Embeddings response) — this stage is a different lens on data that already exists. Demonstrates that nearby positions end up with similar learned embeddings, purely from training.

5. **Self-Attention** — the hero visualization. An arc diagram (query tokens left, key tokens right, arc thickness/opacity = weight) for one layer/head at a time, with a toggle to switch to an **All-Heads grid** (12 small-multiple heatmaps at once). Click a query token to open an editable per-key-token slider breakdown; **Apply & Recompute** renormalizes and sends the edited row to `/api/pipeline/recompute/attention`. Shares its Layer selector with Feed-Forward (see §7) so scrubbing through the transformer stack moves both together.

6. **Feed-Forward Network** — for the selected layer, shows which of the 3072 internal neurons fired strongest for each token. Fetched on demand from `/api/pipeline/layer_detail` (not bundled into the main run — full activations for all layers would be a huge, mostly-useless payload).

7. **Logits** — raw, pre-softmax scores (can be negative, don't sum to 1), shown as zero-anchored bars. Deliberately separated from Sampling so "raw score" and "probability" read as two distinct concepts.

8. **Sampling** — temperature and top-k sliders reweight the candidate distribution (computed client-side from the logits already in hand, `lib/engine/sampling.ts`); **Sample Next Token** performs genuinely random weighted sampling and shows the final output appended to your prompt.

---

## 6. Time Travel, Before/After, and Branching — How They Actually Work

These three features (v1 + v2) all sit on top of one data structure, so understanding it once explains all three.

### The snapshot tree

Every meaningful state of the pipeline — the original run, and every edit after it — is stored as a `Snapshot` with a `parentId` pointing at whatever it was created from:

```ts
interface Snapshot {
  id: string;
  parentId: string | null;   // null only for the root (the original run)
  origin: { stage; description } | null;  // null only for the root
  data: PipelineRunResponse | RecomputeResponse;
}
```

- **Editing an embedding or an attention weight** calls the backend's Time Travel endpoint, gets back the recomputed downstream state, and adds it as a **new child** of whatever snapshot was active.
- **Jumping to an earlier snapshot** (via the Visual History strip) just moves "you are here" — `activeSnapshotId` changes, nothing is deleted.
- **Editing again after jumping back** creates *another* child of that earlier snapshot. If it already had a child from a previous edit, you now have two children — two branches — and **both remain permanently reachable.** This is what makes Branching work: it isn't a separate feature bolted on, it's just what happens naturally once history is a tree instead of a line.

### Before/After

`previousSnapshot()` resolves to either an explicitly chosen comparison target (`compareSnapshotId`, set via the Branch Switcher's "Compare" button) or, by default, the active snapshot's direct parent. Stage views that support ghosting (Embeddings, Sampling) read this and render a faint "before" overlay behind the current "after" state.

### Visual History vs. Branch Switcher

- **Visual History** shows the straight-line path from the root down to whatever snapshot is currently active — you can only ever be *looking at* one branch at a time, so this always reads as a simple list.
- **Branch Switcher** shows every *leaf* (every branch's tip) across the whole tree, letting you jump between entirely different experiments, and pick one as an explicit Before/After comparison target.

---

## 7. The Store — `usePipelineStore.ts`

This is the single piece of state every component reads from. Key fields:

| Field | Purpose |
|---|---|
| `snapshots: Record<string, Snapshot>` | The whole tree, keyed by id |
| `rootId`, `activeSnapshotId` | Which snapshot is the root, which is currently shown |
| `activeStage` | Which of the 8 stages is on screen |
| `compareEnabled`, `compareSnapshotId` | Before/After state |
| `activeLayer` | Shared between Attention and Feed-Forward — moving one moves both |

Every stage component calls `activeSnapshot()` to read current data and `editEmbedding()`/`editAttention()` to trigger Time Travel — no component needs to know anything about the tree structure underneath; the store's selector functions (`pathToActive()`, `leaves()`, `childrenOf()`, etc.) hide that complexity.

---

## 8. Design System — "Signal Spine"

The visual concept: TransLens is fundamentally about tracing a signal through a computation, so the signature element is a single glowing trace (like an oscilloscope line) that physically connects every stage and doubles as the main navigation (`SignalSpine.tsx`).

**Colors** (CSS variables in `app/globals.css`):

| Token | Hex | Meaning |
|---|---|---|
| `--void` | `#08090C` | Background |
| `--signal-cyan` | `#4CE0D2` | Live / model-computed data |
| `--signal-violet` | `#9B7FFF` | Data you edited |
| `--ember` | `#FF6B4A` | Deltas, warnings, negative values |
| `--paper` | `#EDEEF2` | Primary text |
| `--graphite` | `#6B7280` | Secondary text, borders |

**Typography:** Space Grotesk (display headings), Inter (UI body text), JetBrains Mono (every number, token, and vector value — deliberate, not decorative: it's what makes the data feel like real data rather than marketing copy).

---

## 9. Backend API Reference

All routes are on the FastAPI app in `backend/main.py`. Base URL is whatever `NEXT_PUBLIC_MODEL_SERVICE_URL` is set to (defaults to `http://localhost:8000`).

| Method & Path | Purpose |
|---|---|
| `GET /health` | Confirms the gpt2 pipeline model is loaded |
| `POST /api/pipeline/run` | Full forward pass — tokens, embeddings, all-layer hidden states, all-layer/all-head attention, logits, top-k predictions |
| `POST /api/pipeline/recompute/embeddings` | Time Travel: override one or more token embeddings, recompute everything downstream |
| `POST /api/pipeline/recompute/attention` | Time Travel: override one head's attention pattern at one layer, recompute everything downstream |
| `POST /api/pipeline/layer_detail` | On-demand FFN neuron activations for one specific layer |
| `POST /api/explain` | AI Explanations — self-hosted Qwen2.5-0.5B-Instruct explains why an edit changed the output |

Every request/response shape is defined once in `backend/schemas.py` (Pydantic) and mirrored by hand in `frontend/lib/engine/types.ts` / `modelAdapter.ts` (TypeScript) — if you ever change one, change the other, or the two apps will silently disagree about data shape.

---

## 10. Running It

```bash
# Backend
cd translens/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd translens/frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open `localhost:3000`. First backend startup downloads GPT-2 small (~500MB); the first call to `/api/explain` separately downloads Qwen2.5-0.5B-Instruct (~1GB) — both are one-time, cached locally afterward, no repeated cost.

---

## 11. Known Gaps / Where to Look First If Something's Broken

- **Nothing has been run end-to-end yet** (see §1) — the most likely first bugs are in exact TransformerLens hook names (`model_service.py`) and in the `inputs_embeds`/hook-pattern shapes for Time Travel.
- **Before/After ghosting** is only wired into the Embeddings and Sampling stages, not Attention/Tokenization/Positional Encoding/Logits/Feed-Forward.
- **v5 (model choice, deployment hardening)** was deliberately not built — see §12 for why.

---

## 12. What v5 Would Have Been (for reference, not built)

- Swapping between gpt2, distilgpt2, or other small open models instead of gpt2 being hardcoded
- Production deployment hardening (proper CORS lockdown, rate limiting, GPU hosting for faster inference)
- Performance work if actual usage reveals bottlenecks
