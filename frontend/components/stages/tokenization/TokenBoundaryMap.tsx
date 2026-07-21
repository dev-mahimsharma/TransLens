"use client";

import { motion } from "framer-motion";
import type { TokenInfo } from "@/lib/engine/types";

const PALETTE = ["#2563EB", "#4F46E5", "#059669", "#F59E0B", "#EC4899", "#0EA5B7"];

export function TokenBoundaryMap({ tokens }: { tokens: TokenInfo[] }) {
  const totalLen = tokens.reduce((sum, t) => sum + Math.max(t.text.length, 1), 0) || 1;

  return (
    <section className="mt-16">
      <h3 className="text-center font-display text-2xl text-paper">The boundary map</h3>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-graphite">
        Every color is one token. Width is proportional to how many characters it covers.
      </p>

      <div className="mx-auto mt-8 flex max-w-3xl overflow-hidden rounded-xl border border-graphite-dim">
        {tokens.map((token, i) => {
          const width = (Math.max(token.text.length, 1) / totalLen) * 100;
          const color = PALETTE[i % PALETTE.length];
          return (
            <motion.div
              key={token.index}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              style={{
                originX: 0,
                width: `${width}%`,
                background: `${color}22`,
                borderRight: i < tokens.length - 1 ? `1px solid ${color}55` : "none",
              }}
              className="flex h-14 min-w-[2.5rem] items-center justify-center"
              title={token.text}
            >
              <span className="truncate px-1 font-mono text-[11px] text-paper">{token.text.trim() || "·"}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}