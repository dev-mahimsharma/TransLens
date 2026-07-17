"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
  const pathname = usePathname();
  const isExplore = pathname === "/pipeline";

  return (
    <nav className="sticky top-0 z-50 border-b border-graphite-dim/90 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="TransLens home">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-signal-cyan text-base font-bold text-white shadow-glow-cyan transition-transform group-hover:scale-105">T</span>
          <span className="font-display text-xl font-semibold tracking-tight text-paper">TransLens</span>
        </Link>
        <div className="flex items-center gap-1 rounded-lg bg-slate-50 p-1 text-sm">
          <Link href="/" className={`rounded-md px-3.5 py-2 transition-colors ${!isExplore ? "bg-white font-medium text-paper shadow-sm" : "text-graphite hover:text-paper"}`}>Learn</Link>
          <Link href="/pipeline" className={`rounded-md px-3.5 py-2 transition-colors ${isExplore ? "bg-white font-medium text-paper shadow-sm" : "text-graphite hover:text-paper"}`}>Explore</Link>
        </div>
      </div>
    </nav>
  );
}
