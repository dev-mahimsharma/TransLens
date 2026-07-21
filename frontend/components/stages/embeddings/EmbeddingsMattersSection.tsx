"use client";

import { motion } from "framer-motion";

export function EmbeddingMattersSection() {
  return (
    <section>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center text-base leading-relaxed text-graphite"
      >
        A token id like <span className="font-mono text-signal-cyan">4521</span> tells the model nothing about
        meaning — it&apos;s just an index. Embeddings fix this by giving every token a position in a
        high-dimensional space, learned so that related meanings end up geometrically close together.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center"
      >
        <div className="rounded-xl border border-signal-cyan/30 bg-signal-cyan/5 px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-signal-cyan/80">Close together</p>
          <p className="mt-1 font-mono text-sm text-paper">&quot;king&quot; · &quot;queen&quot; · &quot;prince&quot;</p>
        </div>
        <span className="font-mono text-graphite">vs</span>
        <div className="rounded-xl border border-graphite-dim bg-void-raised px-5 py-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">Far apart</p>
          <p className="mt-1 font-mono text-sm text-paper">&quot;king&quot; · &quot;banana&quot;</p>
        </div>
      </motion.div>

      <p className="mx-auto mt-4 max-w-md text-center text-[13px] text-graphite">
        The map below isn&apos;t the illustration above — it&apos;s a live 3D plot of your actual prompt&apos;s embeddings.
      </p>
    </section>
  );
}