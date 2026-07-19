"use client";

import { motion } from "framer-motion";

interface GuideRow {
  label: string;
  explanation: string;
}

const ROWS: GuideRow[] = [
  {
    label: "A glowing point",
    explanation: "One real token from your prompt, positioned by its actual embedding — not by spelling, not by word order.",
  },
  {
    label: "Distance between two points",
    explanation: "Roughly how differently the model currently represents those two tokens at this stage of processing.",
  },
  {
    label: "A connecting line",
    explanation: "Drawn only when two tokens' similarity crosses a threshold — a relationship worth pointing out, not every possible pairing.",
  },
  {
    label: "Brighter / larger glow",
    explanation: "You're hovering it, it's selected, or it's a near neighbor of whatever you're focused on right now.",
  },
  {
    label: "Dimmed points",
    explanation: "Not closely related to your current focus — still there, just visually stepped back so the relevant relationships stand out.",
  },
  {
    label: "The 3D space itself",
    explanation: "A projection, not the real thing. The actual embedding lives in hundreds of dimensions — this view compresses it down to 3 so it's visible at all.",
  },
];

export function HowToReadGuide() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mt-12 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-6"
    >
      <div>
        <p className="font-mono text-[15px] font-bold uppercase tracking-widest text-blue-600 flex justify-center">How to Read This Visualization</p>
        <p className="mt-1.5 text-sm flex justify-center text-slate-500 max-w-2xl leading-relaxed">
          Everything on screen is a simplification built for human eyes — here's exactly what each part stands for, and what it leaves out.
        </p>
      </div>  

      <hr className="border-slate-100" />

      <dl className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
        {ROWS.map((row, idx) => (
          <motion.div 
            key={row.label}
            initial={{ opacity: 0, x: -5 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.04 }}
            className="space-y-1"
          >
            <dt className="text-sm font-bold text-slate-800">{row.label}</dt>
            <dd className="text-xs leading-relaxed text-slate-400">{row.explanation}</dd>
          </motion.div>
        ))}
      </dl>
    </motion.div>
  );
}