"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface Prediction {
  token_id: number;
  token_text: string;
  logit: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function LogitsScoreBoard({
  predictions,
  minLogit,
  maxLogit,
}: {
  predictions: Prediction[];
  minLogit: number;
  maxLogit: number;
}) {
  const range = maxLogit - minLogit || 1;
  // Assuming the predictions are sorted descending by logit score.
  const topLogitId = predictions[0]?.token_id;
  const zeroPos = (-minLogit / range) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-2">
      {predictions.map((pred, i) => {
        const barPos = (pred.logit / range) * 100;
        const isPositive = pred.logit >= 0;
        const isTop = pred.token_id === topLogitId;

        return (
          <motion.div
            key={pred.token_id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 rounded-lg p-1.5 transition-colors ${isTop ? "bg-signal-cyan/5" : ""}`}
          >
            <span className="w-6 shrink-0 text-center text-sm">
              {i < 3 ? MEDALS[i] : <span className="font-mono text-[10px] text-graphite">{i + 1}</span>}
            </span>

            <div className="flex w-20 shrink-0 flex-col items-end text-right">
              <span className={`block w-full truncate font-mono text-sm ${isTop ? "font-semibold text-signal-cyan" : "text-paper"}`}>
                {pred.token_text.trim() || "␣"}
              </span>
            </div>

            <div className="relative h-5 flex-1 overflow-hidden rounded bg-void-raised">
              <div className="absolute top-0 z-10 h-full w-px bg-graphite/40" style={{ left: `${zeroPos}%` }} />
              <motion.div
                className={`absolute top-0 h-full rounded-sm ${
                  isTop ? "bg-signal-cyan shadow-[0_0_12px_rgba(37,99,235,0.5)]" : isPositive ? "bg-signal-cyan/60" : "bg-ember/70"
                }`}
                initial={{ width: 0, left: `${zeroPos}%` }}
                animate={{
                  left: isPositive ? `${zeroPos}%` : `${zeroPos + barPos}%`,
                  width: `${Math.abs(barPos)}%`,
                }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
              />
              {isTop && (
                <motion.div
                  className="absolute inset-0 rounded bg-signal-cyan/20"
                  animate={{ opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              )}
            </div>

            <span className={`w-16 shrink-0 text-right font-mono text-xs ${isTop ? "font-medium text-signal-cyan" : "text-graphite"}`}>
              <AnimatedNumber value={pred.logit} />
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}