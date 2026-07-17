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
    <div className="mt-12">
      <h3 className="font-display text-xl text-paper">What&apos;s actually happening here</h3>
      <p className="mt-2 max-w-lg text-sm text-graphite">
        Eight short answers to the questions people usually have about embeddings — no heavy math required.
      </p>

      {/* The requested analogy, called out separately since it's the
          single most useful mental model for a beginner. */}
      <div className="mt-6 rounded-2xl border border-signal-cyan/30 bg-signal-cyan/5 p-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan">Think of it like a city map</p>
        <p className="mt-2 text-sm leading-relaxed text-graphite">
          Every word lives at a location. Words with similar meanings become neighbors. Words with different meanings
          live in different neighborhoods entirely. The model doesn&apos;t see the word itself — only its coordinates
          on this map.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="rounded-xl border border-graphite-dim bg-void-raised p-4"
          >
            <span className="text-xl">{card.icon}</span>
            <p className="mt-2 font-mono text-xs font-medium text-paper">{card.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-graphite">{card.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}