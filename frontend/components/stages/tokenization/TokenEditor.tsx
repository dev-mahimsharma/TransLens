"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { modelAdapter, type SubTokenInfo } from "@/lib/engine/modelAdapter";
import { LinkButton } from "@/components/ui/LinkButton";

// GPT-2's special "beginning of sequence" token. It's real -- the actual
// initial run genuinely includes it as position 0 -- but it's a
// structural marker the model uses internally, not part of your prompt's
// content, so it shouldn't be editable, deletable, or mergeable like a
// normal token.
const LOCKED_TOKEN_TEXT = "<|endoftext|>";
function isLockedToken(text: string) {
  return text === LOCKED_TOKEN_TEXT;
}

/**
 * One full-width row per token: drag handle, the token text (or an
 * editable input when this row is the one being edited), then Edit and
 * Delete buttons. Only one row edits at a time (editing is controlled by
 * the parent via `editing`/`onStartEdit`/`onFinishEdit`, not local state)
 * so you can't end up with two rows mid-edit simultaneously.
 *
 * Clicking the row body (not the buttons) toggles selection for
 * Merge/Split, same as before -- just moved from a chip's onClick to the
 * row body's onClick so it doesn't collide with the Edit/Delete buttons.
 */
function TokenRow({
  token,
  index,
  selected,
  editing,
  locked,
  onSelect,
  onStartEdit,
  onFinishEdit,
  onRemove,
  onDrop,
}: {
  token: string;
  index: number;
  selected: boolean;
  editing: boolean;
  locked: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onFinishEdit: (value: string) => void;
  onRemove: () => void;
  onDrop: (from: number, to: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(token);

  useEffect(() => {
    if (editing) setDraftValue(token);
  }, [editing, token]);

  function save() {
    onFinishEdit(draftValue);
  }

  const lockedTitle = "Reserved by the model — this marker isn't editable.";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      draggable={!editing && !locked}
      onDragStart={(event) =>
        (event as unknown as React.DragEvent<HTMLDivElement>).dataTransfer.setData("text/plain", String(index))
      }
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(Number((event as unknown as React.DragEvent<HTMLDivElement>).dataTransfer.getData("text/plain")), index);
      }}
      title={locked ? lockedTitle : undefined}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        locked
          ? "border-graphite-dim bg-slate-50 opacity-70"
          : selected
          ? "border-signal-violet bg-indigo-50 shadow-glow-violet"
          : "border-graphite-dim bg-white"
      }`}
    >
      {/* Drag handle -- visually signals the row is draggable without
          requiring the whole row to look interactive. Locked rows show a
          lock glyph instead, so the row's non-interactive state reads
          immediately, not just on hover. */}
      <span className="cursor-grab select-none text-graphite" title={locked ? lockedTitle : "Drag to reorder"}>
        {locked ? "🔒" : "⠿"}
      </span>

      {editing ? (
        <input
          autoFocus
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") onFinishEdit(token); // cancel: revert to original
          }}
          onBlur={save}
          className="flex-1 rounded-lg border border-graphite-dim bg-void-raised px-2 py-1 font-mono text-sm text-paper outline-none focus:border-signal-cyan"
          aria-label={`Edit token ${index + 1}`}
        />
      ) : (
        <button
          onClick={locked ? undefined : onSelect}
          disabled={locked}
          className="flex-1 truncate text-left font-mono text-sm text-paper disabled:cursor-not-allowed"
          title={locked ? lockedTitle : "Click to select for merge/split"}
        >
          {token || "␣"}
        </button>
      )}

      <div className="flex shrink-0 items-center gap-2">
        {locked ? (
          <span className="text-xs text-graphite" title={lockedTitle}>
            Not editable
          </span>
        ) : (
          <>
            <button
              onClick={onStartEdit}
              className="rounded-lg border border-graphite-dim px-2.5 py-1 text-xs font-medium text-graphite hover:text-paper"
              aria-label={`Edit ${token}`}
            >
              Edit
            </button>
            <button
              onClick={onRemove}
              className="rounded-lg border border-graphite-dim px-2.5 py-1 text-xs font-medium text-graphite hover:border-ember hover:text-ember"
              aria-label={`Remove ${token}`}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// initialTokens defaults to [] and is optional -- defensive against any
// caller rendering this without the prop (see earlier bug fix).
export function TokenEditor({ initialTokens = [] }: { initialTokens?: string[] }) {
  const savedTokens = usePipelineStore((s) => s.customTokens);
  const setCustomTokens = usePipelineStore((s) => s.setCustomTokens);
  const runCustomPipeline = usePipelineStore((s) => s.runCustomPipeline);
  const isLoading = usePipelineStore((s) => s.isLoading);
  const error = usePipelineStore((s) => s.error);

  const [tokens, setTokens] = useState<string[]>(savedTokens?.length ? savedTokens : initialTokens);
  const [selected, setSelected] = useState<number[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // Tracks whether any real change has happened yet. Without this, the
  // "Custom tokens" stat would show the same number as "Original tokens"
  // the instant the page loads (since `tokens` starts as a copy of
  // initialTokens for editing purposes) -- which reads as "a custom
  // tokenization already exists" when really nothing's been touched yet.
  const [hasEdited, setHasEdited] = useState(false);

  // Add-token flow: a separate button reveals an inline input next to it.
  // Enter creates the token from whatever was typed, EXACTLY as typed --
  // no trimming, so a token can legitimately contain spaces if that's
  // what the person wants to experiment with.
  const [isAdding, setIsAdding] = useState(false);
  const [newTokenValue, setNewTokenValue] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  // Real-ID lookup: fetched on demand per selected token, not
  // automatically -- calling the backend on every keystroke/selection
  // would be wasteful. Keyed loosely (just holds the result for whichever
  // index was last looked up) since only one token can be selected-alone
  // at a time anyway.
  const [idLookup, setIdLookup] = useState<{ index: number; subTokens: SubTokenInfo[] } | null>(null);
  const [isLookingUpId, setIsLookingUpId] = useState(false);
  const [idLookupError, setIdLookupError] = useState<string | null>(null);

  // Surfaces WHY a merge attempt didn't do anything, instead of the
  // button silently no-op'ing -- merge only makes sense for two ADJACENT
  // tokens (merging non-adjacent tokens would mean deleting whatever's
  // between them, which isn't what "merge" should do), and previously
  // that constraint failed silently with zero feedback.
  const [mergeError, setMergeError] = useState<string | null>(null);

  useEffect(() => {
    setCustomTokens(tokens);
  }, [tokens, setCustomTokens]);

  // This is what makes Custom Mode's whole point work: whatever the final
  // token list looks like when Continue is pressed is exactly what gets
  // sent to the backend and determines every downstream stage's output --
  // there's no separate "confirm" step per edit, the token list IS the
  // single source of truth all the way through.
  const update = (next: string[]) => {
    setTokens(next);
    setSelected([]);
    setHasEdited(true);
    setMergeError(null);
  };

  const merge = () => {
    setMergeError(null);
    if (selected.length !== 2) {
      setMergeError("Select exactly two tokens to merge.");
      return;
    }
    const sorted = [...selected].sort((a, b) => a - b);
    if (sorted[1] !== sorted[0] + 1) {
      setMergeError("Only two ADJACENT tokens can be merged — select tokens next to each other.");
      return;
    }
    if (isLockedToken(tokens[sorted[0]]) || isLockedToken(tokens[sorted[1]])) {
      setMergeError("That token is reserved by the model and can't be merged.");
      return;
    }
    update(
      tokens
        .map((token, i) => (i === sorted[0] ? token + tokens[sorted[1]] : token))
        .filter((_, i) => i !== sorted[1])
    );
  };

  const split = () => {
    if (selected.length !== 1) return;
    const index = selected[0],
      token = tokens[index],
      midpoint = Math.ceil(token.length / 2);
    if (isLockedToken(token)) return; // UI already prevents selecting it, this is a safety net
    if (token.length < 2) return;
    update([...tokens.slice(0, index), token.slice(0, midpoint), token.slice(midpoint), ...tokens.slice(index + 1)]);
  };

  const move = (from: number, to: number) => {
    if (from === to || !Number.isFinite(from)) return;
    const next = [...tokens];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
  };

  function startEdit(index: number) {
    setEditingIndex(index);
    setSelected([]);
  }

  function finishEdit(index: number, value: string) {
    setEditingIndex(null);
    update(tokens.map((item, i) => (i === index ? value : item)));
  }

  function confirmAddToken() {
    if (newTokenValue.length === 0) return; // allow spaces, just not a fully empty add
    update([...tokens, newTokenValue]);
    setNewTokenValue("");
    addInputRef.current?.focus(); // stay open for adding several in a row
  }

  async function viewRealId(index: number) {
    setIsLookingUpId(true);
    setIdLookupError(null);
    try {
      const result = await modelAdapter.tokenizeText(tokens[index]);
      setIdLookup({ index, subTokens: result.sub_tokens });
    } catch (err) {
      setIdLookupError(err instanceof Error ? err.message : "Failed to look up token id");
    } finally {
      setIsLookingUpId(false);
    }
  }

  const chars = tokens.reduce((total, token) => total + token.length, 0);
  const originalCount = initialTokens.length;
  const customTokenCount = hasEdited ? tokens.length : 0;
  const difference = hasEdited ? tokens.length - originalCount : 0;

  const singleSelectedIndex = selected.length === 1 ? selected[0] : null;
  useEffect(() => {
    setIdLookup(null);
    setIdLookupError(null);
  }, [singleSelectedIndex]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Tokens", tokens.length],
          ["Characters", chars],
          ["Context usage", `${Math.max(1, Math.round((tokens.length / 1024) * 100))}%`],
          ["Avg. token length", tokens.length ? (chars / tokens.length).toFixed(1) : "0"],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-graphite-dim bg-void-raised p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">{label}</p>
            <p className="mt-1 text-lg font-semibold text-paper">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <span className="mr-2">🧪</span>
        <strong>Learning Mode</strong>
        <span className="ml-2 text-blue-800">
          This custom tokenization is for educational purposes. Real language models cannot switch tokenization
          after training.
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="rounded-2xl border border-graphite-dim bg-void-raised p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-paper">Current tokens</p>
              <p className="mt-1 text-sm text-graphite">
                Drag a row to reorder. Click a row to select it — select one to Split, or two{" "}
                <span className="font-semibold text-signal-cyan">adjacent</span> rows to Merge.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {mergeError && <p className="max-w-xs text-right text-xs text-ember">{mergeError}</p>}
              <button
                disabled={selected.length !== 1}
                onClick={split}
                className="rounded-lg border border-graphite-dim bg-white px-3 py-2 text-sm font-medium text-paper disabled:opacity-40"
              >
                Split
              </button>
              <button
                disabled={selected.length !== 2}
                onClick={merge}
                className="rounded-lg border border-graphite-dim bg-white px-3 py-2 text-sm font-medium text-paper disabled:opacity-40"
              >
                Merge
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <AnimatePresence>
              {tokens.map((token, index) => (
                <TokenRow
                  key={`${token}-${index}`}
                  token={token}
                  index={index}
                  selected={selected.includes(index)}
                  editing={editingIndex === index}
                  locked={isLockedToken(token)}
                  onSelect={() =>
                    setSelected((items) =>
                      items.includes(index) ? items.filter((item) => item !== index) : [...items, index].slice(-2)
                    )
                  }
                  onStartEdit={() => startEdit(index)}
                  onFinishEdit={(value) => finishEdit(index, value)}
                  onRemove={() => update(tokens.filter((_, i) => i !== index))}
                  onDrop={move}
                />
              ))}
            </AnimatePresence>

            {/* Add-token flow: button + inline input that appears beside
                it. Enter creates the token from the raw typed value --
                spaces are preserved intentionally. */}
            <div className="flex items-center gap-2 pt-1">
              {!isAdding ? (
                <button
                  onClick={() => {
                    setIsAdding(true);
                    setTimeout(() => addInputRef.current?.focus(), 0);
                  }}
                  className="rounded-lg bg-signal-cyan px-3 py-2 text-sm font-medium text-white"
                >
                  + Add Token
                </button>
              ) : (
                <>
                  <input
                    ref={addInputRef}
                    value={newTokenValue}
                    onChange={(e) => setNewTokenValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmAddToken();
                      if (e.key === "Escape") {
                        setIsAdding(false);
                        setNewTokenValue("");
                      }
                    }}
                    placeholder="Type a token, spaces allowed, press Enter"
                    className="flex-1 rounded-lg border border-graphite-dim bg-white px-3 py-2 font-mono text-sm text-paper outline-none focus:border-signal-cyan"
                  />
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewTokenValue("");
                    }}
                    className="rounded-lg border border-graphite-dim px-2.5 py-2 text-xs font-medium text-graphite hover:text-paper"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-graphite-dim bg-white p-5">
          <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-signal-cyan">
            Educational insight
          </p>
          <p className="mt-4 text-sm text-graphite">
            Original tokens: <strong className="text-paper">{originalCount}</strong>
          </p>
          <p className="mt-2 text-sm text-graphite">
            Custom tokens: <strong className="text-paper">{customTokenCount}</strong>
          </p>
          <p className="mt-2 text-sm text-graphite">
            Difference:{" "}
            <strong className="text-paper">
              {difference >= 0 ? "+" : ""}
              {difference}
            </strong>
          </p>
          <ul className="mt-5 space-y-2 text-sm leading-5 text-graphite">
            <li>• Sequence length changes</li>
            <li>• Attention has different positions</li>
            <li>• Each row gets a different embedding</li>
          </ul>

          {/* Selected-token detail panel -- mirrors what Original Mode's
              Tokenization stage shows, adapted for the fact that a REAL
              token id doesn't exist yet here: ids only get assigned once
              the backend actually tokenizes the text, which only happens
              after Continue is pressed. Showing a fake id would be
              misleading, so this is explicit about what isn't known yet. */}
          <div className="mt-6 border-t border-graphite-dim pt-5">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-signal-cyan">
              Selected token
            </p>
            {singleSelectedIndex === null ? (
              <p className="mt-3 text-sm text-graphite">
                Select exactly one token above to see its details.
              </p>
            ) : (
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-graphite">Position in sequence</dt>
                  <dd className="text-paper">{singleSelectedIndex}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-graphite">Text</dt>
                  <dd className="font-mono text-paper">{tokens[singleSelectedIndex] || "(whitespace)"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-graphite">Character length</dt>
                  <dd className="text-paper">{tokens[singleSelectedIndex].length}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-graphite">Original token here</dt>
                  <dd className="font-mono text-paper">
                    {initialTokens[singleSelectedIndex] ?? "(new — no original)"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-graphite">Changed from original</dt>
                  <dd className="text-paper">
                    {tokens[singleSelectedIndex] !== initialTokens[singleSelectedIndex] ? "Yes" : "No"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-graphite">Token id</dt>
                  {idLookup?.index === singleSelectedIndex ? (
                    <dd className="mt-1 space-y-1">
                      {idLookup.subTokens.map((st, i) => (
                        <div key={i} className="font-mono text-paper">
                          id {st.id} <span className="text-graphite">({st.text.trim() || "␣"})</span>
                        </div>
                      ))}
                      {idLookup.subTokens.length > 1 && (
                        <p className="mt-1 text-[11px] text-graphite">
                          This token isn&apos;t a single real vocabulary entry — it decodes to{" "}
                          {idLookup.subTokens.length} real sub-tokens.
                        </p>
                      )}
                    </dd>
                  ) : (
                    <dd>
                      <LinkButton onClick={() => viewRealId(singleSelectedIndex)} disabled={isLookingUpId}>
                        {isLookingUpId ? "Looking up…" : "View real ID"}
                      </LinkButton>
                      {idLookupError && (
                        <p className="mt-1 text-[11px] text-ember">{idLookupError}</p>
                      )}
                    </dd>
                  )}
                </div>
              </dl>
            )}
          </div>
        </aside>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => runCustomPipeline(tokens.filter((t) => t.length > 0))}
          disabled={!tokens.some((t) => t.length > 0) || isLoading}
          className="rounded-xl bg-signal-cyan px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-40"
        >
          {isLoading ? "Processing…" : "Continue →"}
        </button>
        {/* This is what makes a failed Continue actually visible instead
            of silently resetting the button with no explanation --
            previously any backend error here was swallowed with nothing
            shown to the user. */}
        {error && (
          <p className="max-w-md text-right font-mono text-xs text-ember">
            {error} — check that the backend is running and reachable.
          </p>
        )}
      </div>
    </div>
  );
}
