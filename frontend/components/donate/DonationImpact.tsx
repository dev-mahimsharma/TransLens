'use client';

import { motion } from 'framer-motion';
import { Server, Ban, Sparkles, Heart } from 'lucide-react';

const REASONS = [
  { icon: Server, text: 'Keeps a real GPT-2 model running live for every visitor — no query limits, no waitlist.' },
  { icon: Ban, text: "Keeps TransLens ad-free. Forever. No banner ads, no sponsored content, no tracking pixels." },
  { icon: Sparkles, text: "Directly funds the next chapter and the next feature — not a company's margins." },
  { icon: Heart, text: 'You just learned something here for free. This is exactly how it stays free for the next person too.' },
];

export function DonationImpact() {
  return (
    <div className="mt-8 space-y-2.5">
      {REASONS.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="flex items-start gap-3 rounded-xl border border-graphite-dim bg-white p-3.5 text-left"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ember/10 text-ember">
            <r.icon className="h-3.5 w-3.5" />
          </span>
          <p className="text-[13.5px] leading-relaxed text-graphite">{r.text}</p>
        </motion.div>
      ))}
    </div>
  );
}