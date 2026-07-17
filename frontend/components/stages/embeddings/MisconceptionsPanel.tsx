"use client";

interface Misconception {
  myth: string;
  reality: string;
}

const MISCONCEPTIONS: Misconception[] = [
  {
    myth: "The model looks up a dictionary definition.",
    reality: "No definitions are stored anywhere. Just learned numeric patterns shaped by exposure to enormous amounts of text.",
  },
  {
    myth: "Similar spelling means a similar embedding.",
    reality: "\"Car\" and \"care\" look alike but can end up far apart — what matters is how a word is actually used, not how it's spelled.",
  },
  {
    myth: "Each dimension represents one specific concept.",
    reality: "There's no dimension labeled \"animal-ness\" or \"size.\" Meaning is spread across many dimensions working together at once.",
  },
];

const FACTS: string[] = [
  "GPT-2's real embeddings have 768 numbers per token — this view can only show 3 at a time.",
  "Larger modern models can use thousands of dimensions per token.",
  "Humans can't directly visualize more than 3 dimensions — this compression exists purely for teaching.",
  "The real model never \"looks\" at this 3D picture — it only ever works with the full, uncompressed numbers.",
];

export function MisconceptionsPanel() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <h3 className="font-display text-xl text-paper">Common misconceptions</h3>
        <div className="mt-4 space-y-3">
          {MISCONCEPTIONS.map((m) => (
            <div key={m.myth} className="rounded-xl border border-graphite-dim bg-void-raised p-4">
              <p className="font-mono text-xs text-ember">✕ {m.myth}</p>
              <p className="mt-2 text-xs leading-relaxed text-graphite">{m.reality}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl text-paper">Did you know?</h3>
        <div className="mt-4 rounded-xl border border-graphite-dim bg-void-raised p-4">
          <ul className="space-y-3">
            {FACTS.map((fact, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-graphite">
                <span className="text-signal-cyan">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}