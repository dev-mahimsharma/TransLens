"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-4 font-mono text-7xl font-bold tracking-tighter text-signal-cyan opacity-80" style={{ textShadow: "0 0 40px rgba(56,189,248,0.3)" }}>
        404
      </h1>
      <h2 className="mb-4 font-display text-3xl text-paper">We lost this token</h2>
      <p className="mb-10 max-w-md text-graphite leading-relaxed">
        The route you are looking for doesn't exist within this model's architecture. 
        It might have been pruned or never existed in the first place.
      </p>
      
      <button
        onClick={() => router.push("/")}
        className="rounded-full bg-signal-cyan px-6 py-3 font-mono text-sm font-medium uppercase tracking-wider text-white shadow-glow-cyan transition-all hover:-translate-y-0.5 hover:bg-blue-700"
      >
        ← Return Home
      </button>
    </div>
  );
}
