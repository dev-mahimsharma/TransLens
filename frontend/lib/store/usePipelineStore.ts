// Snapshot-based store, per the architecture we agreed on: every user edit
// creates a new Snapshot rather than mutating state in place. Time Travel
// is then just "point activeSnapshotIndex somewhere earlier, then edit
// again" -- editing after traveling back overwrites the future, same as
// classic undo/redo, deliberately NOT a tree (that's Branching, deferred
// to v2 -- see architecture notes).

import { create } from "zustand";
import { modelAdapter } from "../engine/modelAdapter";
import type { PipelineRunResponse, RecomputeResponse, StageId } from "../engine/types";

export interface Snapshot {
  id: string;
  createdAt: number;
  // What produced this snapshot -- null means "the original run".
  origin: { stage: StageId; description: string } | null;
  data: PipelineRunResponse | RecomputeResponseAsFullRun;
}

// RecomputeResponse omits `tokens` (tokens never change after the original
// run), so we carry the original tokens forward into every snapshot to
// keep the shape uniform for consumers.
type RecomputeResponseAsFullRun = Omit<RecomputeResponse, never> & {
  tokens: PipelineRunResponse["tokens"];
};

interface PipelineState {
  prompt: string;
  model: string;
  isLoading: boolean;
  error: string | null;

  snapshots: Snapshot[];
  activeSnapshotIndex: number;

  activeStage: StageId;

  // ---- actions ----
  setPrompt: (prompt: string) => void;
  runPipeline: (prompt: string) => Promise<void>;
  setActiveStage: (stage: StageId) => void;
  jumpToSnapshot: (index: number) => void;

  editEmbedding: (tokenIndex: number, newVector: number[]) => Promise<void>;
  editAttention: (layer: number, head: number, newPattern: number[][]) => Promise<void>;

  activeSnapshot: () => Snapshot | null;
}

function makeSnapshotId() {
  return `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  prompt: "",
  model: "gpt2",
  isLoading: false,
  error: null,

  snapshots: [],
  activeSnapshotIndex: -1,

  activeStage: "prompt",

  setPrompt: (prompt) => set({ prompt }),

  setActiveStage: (stage) => set({ activeStage: stage }),

  runPipeline: async (prompt) => {
    set({ isLoading: true, error: null });
    try {
      const data = await modelAdapter.runPipeline(prompt, get().model);
      const snapshot: Snapshot = {
        id: makeSnapshotId(),
        createdAt: Date.now(),
        origin: null,
        data,
      };
      set({
        prompt,
        snapshots: [snapshot],
        activeSnapshotIndex: 0,
        activeStage: "tokenization",
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to run pipeline",
      });
    }
  },

  jumpToSnapshot: (index) => {
    const { snapshots } = get();
    if (index >= 0 && index < snapshots.length) {
      set({ activeSnapshotIndex: index });
    }
  },

  editEmbedding: async (tokenIndex, newVector) => {
    const { prompt, model, snapshots, activeSnapshotIndex } = get();
    set({ isLoading: true, error: null });
    try {
      const data = await modelAdapter.recomputeFromEmbeddings(
        prompt,
        { [tokenIndex]: newVector },
        model
      );
      const current = snapshots[activeSnapshotIndex];
      const snapshot: Snapshot = {
        id: makeSnapshotId(),
        createdAt: Date.now(),
        origin: { stage: "embeddings", description: `Edited embedding for token ${tokenIndex}` },
        data: { ...data, tokens: current.data.tokens },
      };
      // Editing after traveling back truncates any "future" snapshots --
      // this is the classic undo/redo semantics, deliberately not a tree.
      const truncated = snapshots.slice(0, activeSnapshotIndex + 1);
      set({
        snapshots: [...truncated, snapshot],
        activeSnapshotIndex: truncated.length,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to recompute from embeddings",
      });
    }
  },

  editAttention: async (layer, head, newPattern) => {
    const { prompt, model, snapshots, activeSnapshotIndex } = get();
    set({ isLoading: true, error: null });
    try {
      const data = await modelAdapter.recomputeFromAttention(prompt, layer, head, newPattern, model);
      const current = snapshots[activeSnapshotIndex];
      const snapshot: Snapshot = {
        id: makeSnapshotId(),
        createdAt: Date.now(),
        origin: {
          stage: "attention",
          description: `Edited layer ${layer}, head ${head} attention pattern`,
        },
        data: { ...data, tokens: current.data.tokens },
      };
      const truncated = snapshots.slice(0, activeSnapshotIndex + 1);
      set({
        snapshots: [...truncated, snapshot],
        activeSnapshotIndex: truncated.length,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to recompute from attention",
      });
    }
  },

  activeSnapshot: () => {
    const { snapshots, activeSnapshotIndex } = get();
    return snapshots[activeSnapshotIndex] ?? null;
  },
}));
