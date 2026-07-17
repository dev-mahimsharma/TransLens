"use client";

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
    <div className="mt-12 rounded-2xl border border-graphite-dim bg-void-raised p-6">
      <p className="font-mono text-[11px] uppercase tracking-wider text-signal-cyan">How to Read This Visualization</p>
      <p className="mt-2 max-w-lg text-sm text-graphite">
        Everything on screen is a simplification built for human eyes — here&apos;s exactly what each part stands for, and what it leaves out.
      </p>

      <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {ROWS.map((row) => (
          <div key={row.label}>
            <dt className="font-mono text-xs font-medium text-paper">{row.label}</dt>
            <dd className="mt-1 text-xs leading-relaxed text-graphite">{row.explanation}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}