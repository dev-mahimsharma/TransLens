"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { modelAdapter, type PositionInfo } from "@/lib/engine/modelAdapter";
import { PositionHeatmap } from "./PositionHeatmap";

const EXAMPLE = "The quick brown fox jumps";

export function PositionPlayground() {
  const [input, setInput] = useState(EXAMPLE);
  const [positions, setPositions] = useState<PositionInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await modelAdapter.getPositionalEncoding(input.trim());
      setPositions(result.positions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compute positional encoding");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">Playground</h3>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-graphite">
        Type any sentence — this recomputes real positional vectors instantly, without running the full model.
      </p>

      <div className="mx-auto mt-6 flex max-w-xl items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRun()}
          placeholder="Type a sentence…"
          className="flex-1 rounded-xl border border-graphite-dim bg-white px-4 py-2.5 font-mono text-sm text-paper shadow-sm outline-none focus:border-signal-cyan"
        />
        <button
          onClick={handleRun}
          disabled={isLoading || !input.trim()}
          className="rounded-xl bg-signal-cyan px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isLoading ? "Computing…" : "Visualize"}
        </button>
      </div>

      {error && <p className="mt-3 text-center font-mono text-xs text-ember">{error}</p>}

      {positions && positions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <div className="flex flex-wrap justify-center gap-2">
            {positions.map((p) => (
              <span
                key={p.index}
                className="rounded-full border border-graphite-dim bg-white px-3 py-1.5 font-mono text-xs text-paper shadow-sm"
              >
                {p.token_text.trim() || "␣"} <span className="text-signal-cyan">·{p.index}</span>
              </span>
            ))}
          </div>

          {positions.length >= 2 && (
            <div className="mt-8">
              <PositionHeatmap
                labels={positions.map((p) => p.token_text)}
                vectors={positions.map((p) => p.vector)}
                cellSize={36}
              />
            </div>
          )}

          <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-xl border border-graphite-dim bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-graphite-dim bg-slate-50">
                  <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-graphite">Position</th>
                  <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-graphite">Token</th>
                  <th className="px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-graphite">Vector preview</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.index} className="border-b border-graphite-dim last:border-0">
                    <td className="px-4 py-2 font-mono text-signal-cyan">{p.index}</td>
                    <td className="px-4 py-2 font-mono text-paper">{p.token_text.trim() || "␣"}</td>
                    <td className="px-4 py-2 font-mono text-graphite">
                      [{p.vector.slice(0, 3).map((v) => v.toFixed(2)).join(", ")}, …]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </section>
  );
}