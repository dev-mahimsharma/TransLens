// Branching rewrite. Snapshots used to be a flat array with an
// activeSnapshotIndex, where editing after Time Travel truncated
// everything after that point (classic undo/redo). That was the right
// call for v1 -- it kept Time Travel simple while the rest of the
// pipeline was being built.
//
// Branching changes the requirement: editing after traveling back should
// FORK a new branch, not erase the one that was there. So snapshots are
// now a tree (each one points at its parentId) instead of a line. Jumping
// to an earlier snapshot no longer destroys anything -- it just moves
// "you are here". Editing from that point creates a new child, and if
// that snapshot already had a child from a previous edit, you now have
// two children = two branches, exactly like a git commit graph.
//
// Time Travel and Before/After both keep working unchanged from the
// outside: activeSnapshot() and previousSnapshot() still exist with the
// same names, so components built against the old store didn't need to
// change. previousSnapshot() now means "the comparison target" -- either
// an explicitly chosen snapshot (for comparing two branches) or, by
// default, the active snapshot's parent.

import { create } from "zustand";
import { modelAdapter } from "../engine/modelAdapter";
import type { PipelineRunResponse, RecomputeResponse, StageId } from "../engine/types";

export interface Snapshot {
  id: string;
  parentId: string | null;
  createdAt: number;
  origin: { stage: StageId; description: string } | null;
  data: PipelineRunResponse | RecomputeResponseAsFullRun;
}

type RecomputeResponseAsFullRun = Omit<RecomputeResponse, never> & {
  tokens: PipelineRunResponse["tokens"];
};

interface PipelineState {
  prompt: string;
  model: string;
  isLoading: boolean;
  error: string | null;

  // Tree storage: id -> snapshot. A map (not an array) because branching
  // means we need fast parent/child lookups, not just sequential access.
  snapshots: Record<string, Snapshot>;
  rootId: string | null;
  activeSnapshotId: string | null;

  activeStage: StageId;

  compareEnabled: boolean;
  // Explicit compare target, e.g. "compare this branch against that one".
  // null means "fall back to the active snapshot's parent".
  compareSnapshotId: string | null;

  // Shared across Attention and Feed-Forward Network stages so scrubbing
  // through the transformer stack in one place moves both -- this is what
  // makes it read as "navigating the layers" rather than two independent,
  // coincidentally-similar controls.
  activeLayer: number;

  // "original" = view-only walkthrough of a real GPT-2 run, no editing.
  // "custom" = the full interactive experience (Time Travel, Branching,
  // Before/After, editable Embeddings/Attention). Read by /pipeline/page.tsx
  // to decide which stage component variant to render.
  learningMode: "original" | "custom";

  // Custom Mode's editable-tokenization feature: the user's current
  // split/merge/edit/reorder state, kept in the store (not just local
  // component state) so it survives navigating away from the
  // Tokenization stage and back.
  customTokens: string[];

  // ---- actions ----
  setPrompt: (prompt: string) => void;
  runPipeline: (prompt: string) => Promise<void>;
  setActiveStage: (stage: StageId) => void;
  jumpToSnapshot: (id: string) => void;
  toggleCompare: () => void;
  setCompareSnapshot: (id: string | null) => void;
  setActiveLayer: (layer: number) => void;
  setLearningMode: (mode: "original" | "custom") => void;
  setCustomTokens: (tokens: string[]) => void;
  runCustomPipeline: (customTokens: string[]) => Promise<void>;

  editEmbedding: (tokenIndex: number, newVector: number[]) => Promise<void>;
  editAttention: (layer: number, head: number, newPattern: number[][]) => Promise<void>;

  // ---- selectors (derived reads, not stored state) ----
  activeSnapshot: () => Snapshot | null;
  previousSnapshot: () => Snapshot | null; // the compare target, see note above
  pathToActive: () => Snapshot[]; // root -> ... -> active, for the history strip
  childrenOf: (id: string) => Snapshot[];
  leaves: () => Snapshot[]; // branch tips -- every snapshot with no children
  activeHasSibling: () => boolean; // true if editing now would create a NEW branch
}

function makeSnapshotId() {
  return `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  prompt: "",
  model: "gpt2",
  isLoading: false,
  error: null,

  snapshots: {},
  rootId: null,
  activeSnapshotId: null,

  activeStage: "prompt",
  compareEnabled: false,
  compareSnapshotId: null,
  activeLayer: 0,
  learningMode: "original",
  customTokens: [],

  setPrompt: (prompt) => set({ prompt }),
  setActiveStage: (stage) => set({ activeStage: stage }),
  toggleCompare: () => set((s) => ({ compareEnabled: !s.compareEnabled })),
  setCompareSnapshot: (id) => set({ compareSnapshotId: id, compareEnabled: true }),
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setLearningMode: (mode) => set({ learningMode: mode }),
  setCustomTokens: (tokens) => set({ customTokens: tokens }),

  runCustomPipeline: async (customTokens) => {
    set({ isLoading: true, error: null });
    try {
      const data = await modelAdapter.runCustomTokens(customTokens, get().model);
      const id = makeSnapshotId();
      const snapshot: Snapshot = { id, parentId: null, createdAt: Date.now(), origin: null, data };
      set({
        // Fresh root, same as runPipeline -- this is a materially
        // different run (simulated custom tokenization), not an edit of
        // the previous one, so it gets its own tree rather than becoming
        // a Time Travel branch off the real run.
        snapshots: { [id]: snapshot },
        rootId: id,
        activeSnapshotId: id,
        activeStage: "embeddings",
        compareSnapshotId: null,
        compareEnabled: false,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to run custom tokenization",
      });
    }
  },

  runPipeline: async (prompt) => {
    set({ isLoading: true, error: null });
    try {
      const data = await modelAdapter.runPipeline(prompt, get().model);
      const id = makeSnapshotId();
      const snapshot: Snapshot = { id, parentId: null, createdAt: Date.now(), origin: null, data };
      set({
        prompt,
        snapshots: { [id]: snapshot }, // starting a new prompt clears any old tree
        rootId: id,
        activeSnapshotId: id,
        activeStage: "tokenization",
        compareSnapshotId: null,
        compareEnabled: false,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to run pipeline" });
    }
  },

  jumpToSnapshot: (id) => {
    if (get().snapshots[id]) set({ activeSnapshotId: id });
  },

  editEmbedding: async (tokenIndex, newVector) => {
    const { prompt, model, snapshots, activeSnapshotId } = get();
    if (!activeSnapshotId) return;
    set({ isLoading: true, error: null });
    try {
      const data = await modelAdapter.recomputeFromEmbeddings(prompt, { [tokenIndex]: newVector }, model);
      const current = snapshots[activeSnapshotId];
      const id = makeSnapshotId();
      const snapshot: Snapshot = {
        id,
        parentId: activeSnapshotId,
        createdAt: Date.now(),
        origin: { stage: "embeddings", description: `Edited embedding for token ${tokenIndex}` },
        data: { ...data, tokens: current.data.tokens },
      };
      // NOTE: no truncation -- this just adds a new child. If activeSnapshotId
      // already had a child (from an earlier edit made from this same
      // point), this snapshot becomes a SIBLING of that child, i.e. a new
      // branch, and both remain reachable.
      set({
        snapshots: { ...snapshots, [id]: snapshot },
        activeSnapshotId: id,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to recompute from embeddings" });
    }
  },

  editAttention: async (layer, head, newPattern) => {
    const { prompt, model, snapshots, activeSnapshotId } = get();
    if (!activeSnapshotId) return;
    set({ isLoading: true, error: null });
    try {
      const data = await modelAdapter.recomputeFromAttention(prompt, layer, head, newPattern, model);
      const current = snapshots[activeSnapshotId];
      const id = makeSnapshotId();
      const snapshot: Snapshot = {
        id,
        parentId: activeSnapshotId,
        createdAt: Date.now(),
        origin: { stage: "attention", description: `Edited layer ${layer}, head ${head} attention pattern` },
        data: { ...data, tokens: current.data.tokens },
      };
      set({
        snapshots: { ...snapshots, [id]: snapshot },
        activeSnapshotId: id,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Failed to recompute from attention" });
    }
  },

  activeSnapshot: () => {
    const { snapshots, activeSnapshotId } = get();
    return activeSnapshotId ? snapshots[activeSnapshotId] ?? null : null;
  },

  previousSnapshot: () => {
    const { snapshots, activeSnapshotId, compareSnapshotId } = get();
    if (compareSnapshotId) return snapshots[compareSnapshotId] ?? null;
    const active = activeSnapshotId ? snapshots[activeSnapshotId] : null;
    if (!active || !active.parentId) return null;
    return snapshots[active.parentId] ?? null;
  },

  pathToActive: () => {
    const { snapshots, activeSnapshotId } = get();
    const path: Snapshot[] = [];
    let current = activeSnapshotId ? snapshots[activeSnapshotId] : null;
    while (current) {
      path.unshift(current);
      current = current.parentId ? snapshots[current.parentId] : null;
    }
    return path;
  },

  childrenOf: (id) => {
    const { snapshots } = get();
    return Object.values(snapshots).filter((s) => s.parentId === id);
  },

  leaves: () => {
    const { snapshots } = get();
    const all = Object.values(snapshots);
    const parentIds = new Set(all.map((s) => s.parentId).filter(Boolean));
    return all.filter((s) => !parentIds.has(s.id));
  },

  activeHasSibling: () => {
    const { snapshots, activeSnapshotId } = get();
    const active = activeSnapshotId ? snapshots[activeSnapshotId] : null;
    if (!active) return false;
    return Object.values(snapshots).some((s) => s.parentId === active.parentId && s.id !== active.id);
  },
}));
