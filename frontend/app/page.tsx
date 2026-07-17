"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePipelineStore } from "@/lib/store/usePipelineStore";

const EXAMPLE_PROMPT = "The cat sat on the";

export default function LandingPage() {
  const router = useRouter();
  const [input, setInput] = useState(EXAMPLE_PROMPT);
  const runPipeline = usePipelineStore((s) => s.runPipeline);
  const isLoading = usePipelineStore((s) => s.isLoading);
  const error = usePipelineStore((s) => s.error);
  const learningMode = usePipelineStore((s) => s.learningMode);
  const setLearningMode = usePipelineStore((s) => s.setLearningMode);

  const modeContent = learningMode === "original"
    ? {
        title: "Original Model",
        description: "Visualize how a real Large Language Model tokenizes and processes your prompt using its built-in tokenizer. This represents how the selected model actually works.",
      }
    : {
        title: "Custom Mode",
        description: "Experiment with your own tokenization. Split, merge, or edit tokens to understand how token boundaries influence embeddings, attention, and the model's internal processing. This mode is designed for learning and does not represent the behavior of a real LLM.",
      };

  async function handleEnter() {
    if (!input.trim()) return;
    await runPipeline(input.trim());
    router.push("/pipeline");
  }

  return (
    <main className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_at_top,_rgba(219,234,254,0.8),_transparent_68%)]" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-3xl text-center"
      >
        <p className="mb-5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-signal-cyan">
          Interactive LLM learning lab
        </p>
        <h1 className="mb-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-paper sm:text-6xl">
          See how language models
          <br />
          make a prediction.
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-base leading-7 text-graphite sm:text-lg">
          Type a prompt. Watch it become tokens, vectors, attention, and a
          prediction—one running transformer, with every step clear and editable.
        </p>

        <div className="mx-auto mb-8 max-w-2xl text-left">
          <p className="mb-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-graphite">Learning mode</p>
          <div className="mx-auto flex w-fit rounded-xl border border-graphite-dim bg-slate-50 p-1.5">
            {(["original", "custom"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setLearningMode(mode)}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${learningMode === mode ? "bg-white text-paper shadow-sm" : "text-graphite hover:text-paper"}`}
                aria-pressed={learningMode === mode}
              >
                {mode === "original" ? "Original Model" : "Custom Mode"}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={learningMode}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="surface-card mt-4 rounded-xl bg-white p-4 text-left"
            >
              <p className="text-sm font-semibold text-paper">{modeContent.title}</p>
              <p className="mt-1 text-sm leading-6 text-graphite">{modeContent.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="surface-card mx-auto flex max-w-2xl items-center gap-3 rounded-2xl bg-white p-2.5 pl-6 transition-all focus-within:border-signal-cyan focus-within:shadow-glow-cyan">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
            placeholder="Type a prompt..."
            className="flex-1 bg-transparent text-base text-paper outline-none placeholder:text-graphite"
            maxLength={200}
          />
          <button
            onClick={handleEnter}
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-signal-cyan px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? "Loading…" : "Enter"}
          </button>
        </div>

        {error && (
          <p className="mt-4 font-mono text-xs text-ember">{error}</p>
        )}

        <p className="mt-6 font-mono text-[11px] tracking-wide text-graphite">
          GPT-2 Small &nbsp;·&nbsp; 124M parameters &nbsp;·&nbsp; 12 layers &nbsp;·&nbsp; 12 heads
        </p>
      </motion.div>
    </main>
  );
}
