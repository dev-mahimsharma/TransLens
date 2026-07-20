"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePipelineStore } from "@/lib/store/usePipelineStore";
import { LiveMiniPreview } from "@/components/landing/LandingMiniPreview";
import { PoweredByGPT2 } from "@/components/landing/PoweredByGPT2";
import { PipelineFeatureGrid } from "@/components/landing/PipelineFeatureGrid";
import { LearnVsExplore } from "@/components/landing/LearnVsExplore";
import { ClosingCTA } from "@/components/landing/ClosingCTA";
import { AnimatedPlaceholder } from "@/components/ui/AnimatedPlaceholder";

const EXAMPLE_PROMPT = "";

export default function LandingPage() {
  const router = useRouter();
  const [input, setInput] = useState(EXAMPLE_PROMPT);
  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const runPipeline = usePipelineStore((s) => s.runPipeline);
  const isLoading = usePipelineStore((s) => s.isLoading);
  const error = usePipelineStore((s) => s.error);
  const learningMode = usePipelineStore((s) => s.learningMode);
  const setLearningMode = usePipelineStore((s) => s.setLearningMode);

  const modeContent = learningMode === "original"
    ? {
        title: "Original Mode",
        description: "Visualize how a real Large Language Model tokenizes and processes your prompt using its built-in tokenizer. This represents how the selected model actually works.",
      }
    : {
        title: "Custom Mode (Under Maintenance)",
        description: "Experiment with your own tokenization. Split, merge, or edit tokens to understand how token boundaries influence embeddings, attention, and the model's internal processing. This premium feature is coming soon.",
      };

  async function handleEnter() {
    if (!input.trim()) return;
    await runPipeline(input.trim());
    router.push("/pipeline");
  }

  return (
    <>
      <AnimatePresence>
        {learningMode === "custom" && showPremiumBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-gradient-to-r from-signal-cyan/20 to-signal-violet/20 border-b border-signal-cyan/30 flex justify-center items-center py-2 px-6 relative z-50 overflow-hidden"
          >
            <span className="text-[11px] sm:text-xs font-mono font-medium text-paper text-center pr-8">
              <span className="text-signal-cyan uppercase tracking-wider mr-2">Notice:</span>
              Unlock the Black Box. Custom Mode is an upcoming premium feature that lets you freely edit token weights and hack the attention mechanism.
            </span>
            <button
              onClick={() => setShowPremiumBanner(false)}
              className="absolute right-4 text-graphite hover:text-paper font-mono text-xs transition-colors p-1"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_at_top,_rgba(219,234,254,0.8),_transparent_68%)]" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-3xl text-center"
        >
          <p className="mb-5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-signal-cyan">
            A real transformer, thinking out loud
          </p>
          <h1 className="mb-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-paper sm:text-6xl">
            Stop imagining how AI thinks.
            <br />
            Watch it happen.
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-base leading-7 text-graphite sm:text-lg">
            Type a prompt. Watch real GPT-2 weights turn your words into tokens, vectors, attention, and a
            prediction — live, in your browser, one step exposed at a time. Nothing here is faked for effect.
          </p>

          <div className="mx-auto mb-8 max-w-2xl text-left">
            <p className="mb-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-graphite">Learning mode</p>
            <div className="mx-auto flex w-fit rounded-xl border border-graphite-dim bg-slate-50 p-1.5">
              {(["original", "custom"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLearningMode(mode)}
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${learningMode === mode ? "bg-signal-cyan text-white shadow-md" : "text-graphite hover:text-paper"}`}
                  aria-pressed={learningMode === mode}
                  title={mode === "custom" ? "Premium feature under maintenance" : ""}
                >
                  {mode === "original" ? "Original Mode" : "Custom Mode 🔒"}
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

          <div id="prompt-input" className="relative mx-auto max-w-2xl group scroll-mt-24">
            {learningMode === "custom" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-void/10 backdrop-blur-[1px] cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="font-mono text-xs uppercase tracking-wider text-signal-cyan font-semibold bg-white/90 px-4 py-2 rounded-full shadow-md border border-signal-cyan/20">
                  Premium Feature Coming Soon
                </span>
              </div>
            )}
            <div
              className={`surface-card flex items-center gap-3 rounded-2xl bg-white p-2.5 pl-6 transition-all ${learningMode === "custom" ? "opacity-60 cursor-not-allowed border-graphite-dim" : "focus-within:border-signal-cyan focus-within:shadow-glow-cyan"}`}
            >
              <div className="relative flex-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                  className="relative z-10 w-full bg-transparent text-base text-paper outline-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
                  maxLength={200}
                  disabled={learningMode === "custom"}
                  title={learningMode === "custom" ? "Premium feature coming soon!" : ""}
                />
                <AnimatedPlaceholder active={input.length === 0 && learningMode !== "custom"} />
              </div>
              <button
                onClick={handleEnter}
                disabled={isLoading || !input.trim() || learningMode === "custom"}
                className="rounded-xl bg-signal-cyan px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                title={learningMode === "custom" ? "Premium feature coming soon!" : ""}
              >
                {isLoading ? "Loading…" : "Enter"}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 font-mono text-xs text-ember">{error}</p>
          )}

          <div className="mt-8 flex flex-col items-center">
            <p className="font-mono text-[11px] tracking-wide text-graphite">
              GPT-2 Small &nbsp;·&nbsp; 124M parameters &nbsp;·&nbsp; 12 layers &nbsp;·&nbsp; 12 heads
            </p>
            <p className="mt-2 font-mono text-[10px] text-graphite/70 max-w-md">
              Real weights. Real math. This is what GPT-2 actually does with your exact sentence.
            </p>
          </div>
        </motion.div>
      </main>

      <LiveMiniPreview />
      <PoweredByGPT2 />
      <PipelineFeatureGrid />
      <LearnVsExplore />
      <ClosingCTA />
    </>
  );
}