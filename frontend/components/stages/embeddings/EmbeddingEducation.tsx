"use client";

import { motion } from "framer-motion";

interface EducationCard {
  icon: string;
  title: string;
  body: string;
}

const CARDS: EducationCard[] = [
  {
    icon: "🔢",
    title: "What is an embedding?",
    body: "A list of numbers that stands in for a piece of text — like a fingerprint made of numbers instead of ridges, so a computer has something it can actually compute with.",
  },
  {
    icon: "🧮",
    title: "Why can't AI read text directly?",
    body: "Computers only do math. They can't \"read\" the letters c-a-t and picture a furry animal — so every word gets turned into numbers first.",
  },
  {
    icon: "📏",
    title: "Why convert words into numbers?",
    body: "Numbers can be compared and measured. Once \"cat\" is a list of numbers, the model can ask \"how similar is this to dog?\" with simple math.",
  },
  {
    icon: "🏋️",
    title: "How are embeddings learned?",
    body: "During training, these numbers get nudged millions of times until words that behave similarly in real sentences end up with similar numbers. Nobody writes them by hand.",
  },
  {
    icon: "🚫",
    title: "Why doesn't one number mean anything?",
    body: "No single ridge on a fingerprint identifies a person — only the whole pattern does. Same here: dimension #482 alone tells you nothing on its own.",
  },
  {
    icon: "🧩",
    title: "Where does the meaning actually live?",
    body: "In the pattern across ALL the numbers together — how they relate to each other — not in any one of them picked out in isolation.",
  },
  {
    icon: "🧲",
    title: "Why do similar meanings end up close together?",
    body: "Training rewards the model for giving similar numbers to words used in similar ways — so \"cat\" and \"dog\" naturally drift toward each other over time.",
  },
  {
    icon: "🔭",
    title: "Why is this 3D view a simplification?",
    body: "A real embedding has hundreds of numbers — far more than 3. We compress it down to 3 purely so human eyes can look at it. The model itself never sees this picture.",
  },
];

export function EmbeddingEducation() {
  return (
    <div className="mt-16 space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">What's actually happening here</h3>
        <p className="mt-1.5 font-mono text-xs text-slate-400">
          Eight short answers to the questions people usually have about embeddings — no heavy math required.
        </p>
      </div>

      {/* City Map Analogy Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm"
      >
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">Think of it like a city map</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Every word lives at a location. Words with similar meanings become neighbors. Words with different meanings
          live in different neighborhoods entirely. The model doesn't see the word itself — only its coordinates
          on this map.
        </p>
      </motion.div>

      {/* Grid Layout Matrix */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-colors hover:border-slate-200"
          >
            <div className="space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-xl border border-slate-100">
                {card.icon}
              </div>
              <p className="font-bold text-sm text-slate-800 leading-tight">{card.title}</p>
              <p className="text-xs leading-relaxed text-slate-400">{card.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}