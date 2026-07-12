"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePipelineStore } from "@/lib/store/usePipelineStore";

const EXAMPLE_PROMPT = "The cat sat on the";

export default function LandingPage() {
  const router = useRouter();
  const [input, setInput] = useState(EXAMPLE_PROMPT);
  const runPipeline = usePipelineStore((s) => s.runPipeline);
  const isLoading = usePipelineStore((s) => s.isLoading);
  const error = usePipelineStore((s) => s.error);

  async function handleEnter() {
    if (!input.trim()) return;
    await runPipeline(input.trim());
    router.push("/pipeline");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl text-center"
      >
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-cyan">
          Step inside the model
        </p>
        <h1 className="mb-6 font-display text-4xl font-medium leading-tight text-paper sm:text-5xl">
          Don&apos;t just ask an AI.
          <br />
          Watch it think.
        </h1>
        <p className="mx-auto mb-12 max-w-md text-graphite">
          Type a prompt. Watch it become tokens, vectors, attention, and a
          prediction — one real, running transformer, every step visible and
          editable.
        </p>

        <div className="mx-auto flex max-w-xl items-center gap-3 rounded-full border border-graphite-dim bg-void-raised px-6 py-4 shadow-glow-cyan/0 transition-shadow focus-within:shadow-glow-cyan">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
            placeholder="Type a prompt..."
            className="flex-1 bg-transparent font-mono text-sm text-paper outline-none placeholder:text-graphite"
            maxLength={200}
          />
          <button
            onClick={handleEnter}
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-signal-cyan px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-void transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? "Loading…" : "Enter"}
          </button>
        </div>

        {error && (
          <p className="mt-4 font-mono text-xs text-ember">{error}</p>
        )}

        <p className="mt-6 font-mono text-xs text-graphite">
          gpt2-small · 124M params · 12 layers · 12 heads
        </p>
      </motion.div>
    </main>
  );
}
