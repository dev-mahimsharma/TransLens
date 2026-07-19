"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { modelAdapter, type AttentionMathStep } from "@/lib/engine/modelAdapter";

interface AttentionMathBreakdownProps {
  prompt: string;
  layer: number;
  head: number;
  queryIndex: number;
}

export function AttentionMathBreakdown({ prompt, layer, head, queryIndex }: AttentionMathBreakdownProps) {
  const [steps, setSteps] = useState<AttentionMathStep[] | null>(null);
  const [queryText, setQueryText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    modelAdapter
      .getAttentionMath(prompt, layer, head, queryIndex)
      .then((result) => {
        if (cancelled) return;
        setSteps(result.steps);
        setQueryText(result.query_token_text);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load math breakdown");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [prompt, layer, head, queryIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-8 max-w-2xl rounded-2xl border border-graphite-dim bg-white p-6 shadow-sm"
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-signal-violet">
        Real attention math for &ldquo;{queryText.trim() || "␣"}&rdquo; — Layer {layer}, Head {head}
      </p>
      <p className="mt-1 text-xs text-graphite">
        Every column below is a real number pulled from the model — this is exactly what it computed, not an approximation.
      </p>

      {isLoading && <p className="mt-4 font-mono text-xs text-graphite">Computing…</p>}
      {error && <p className="mt-4 font-mono text-xs text-ember">{error}</p>}

      {steps && !isLoading && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-graphite-dim">
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-graphite">Key token</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-graphite">Q · K (raw)</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-graphite">Scaled + masked</th>
                <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-graphite">Softmax weight</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s) => {
                const isMasked = s.scaled_score < -1e5;
                return (
                  <tr key={s.key_index} className="border-b border-graphite-dim last:border-0">
                    <td className="px-3 py-2 font-mono text-paper">{s.key_token_text.trim() || "␣"}</td>
                    <td className="px-3 py-2 font-mono text-graphite">{s.raw_dot_product.toFixed(2)}</td>
                    <td className="px-3 py-2 font-mono text-graphite">
                      {isMasked ? <span className="text-ember">masked</span> : s.scaled_score.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-signal-cyan"
                            style={{ width: `${s.softmax_weight * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-signal-cyan">{(s.softmax_weight * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-4 text-xs leading-relaxed text-graphite">
            The raw dot product measures how well this query&apos;s Q vector matches each token&apos;s K vector. The
            model scales that down (divides by √64, since each head has 64 dimensions) and masks out any future
            tokens (causal attention can&apos;t look ahead). Softmax then turns what&apos;s left into a proper
            probability distribution — the final weights you see everywhere else in this page.
          </p>
        </div>
      )}
    </motion.div>
  );
}