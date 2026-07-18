"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("TransLens caught an error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 h-24 w-24 rounded-full bg-ember/10 flex items-center justify-center border border-ember/20 shadow-[0_0_40px_rgba(255,100,100,0.1)]">
        <span className="text-4xl text-ember font-mono">!</span>
      </div>
      <h2 className="mb-4 font-display text-4xl text-paper">Oops, a latent space anomaly</h2>
      <p className="mb-10 max-w-md text-graphite leading-relaxed">
        We ran into a critical error rendering this transformer stage. 
        Don't worry, the weights are intact. Let's return to the prompt lab.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="rounded-full border border-graphite-dim px-6 py-2.5 font-mono text-sm uppercase tracking-wider text-graphite transition-colors hover:border-graphite hover:text-paper"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push("/")}
          className="rounded-full bg-signal-cyan px-6 py-2.5 font-mono text-sm font-medium uppercase tracking-wider text-white shadow-glow-cyan transition-all hover:-translate-y-0.5 hover:bg-blue-700"
        >
          ← Return Home
        </button>
      </div>
    </div>
  );
}
