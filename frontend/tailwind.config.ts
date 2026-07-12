import type { Config } from "tailwindcss";

// Design tokens for the "Signal Spine" visual language. Values live here
// AND as CSS variables in globals.css -- Tailwind classes for static
// styling, CSS vars for anything animated or computed at runtime (glow
// intensity, pulse position, etc).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#08090C",
        "void-raised": "#0F1116", // one step up from bg, for panels/cards
        signal: {
          cyan: "#4CE0D2",   // live/computed data flowing through the pipeline
          violet: "#9B7FFF", // user-edited data -- always visually distinct from computed
        },
        ember: "#FF6B4A",     // deltas, drops, warnings
        paper: "#EDEEF2",     // primary text
        graphite: {
          DEFAULT: "#6B7280",
          dim: "#4A4E5A",     // borders, dividers, inactive spine segments
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 24px 0 rgba(76, 224, 210, 0.35)",
        "glow-violet": "0 0 24px 0 rgba(155, 127, 255, 0.35)",
      },
      animation: {
        "pulse-spine": "pulse-spine 1.8s ease-in-out infinite",
      },
      keyframes: {
        "pulse-spine": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
