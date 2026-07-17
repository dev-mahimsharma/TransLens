import type { Config } from "tailwindcss";

// Design tokens for the light, high-clarity TransLens interface. Values live
// here and in globals.css so static utilities and interactive visualizations
// always share the same visual language.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#FFFFFF",
        "void-raised": "#F8F9FB",
        signal: {
          cyan: "#2563EB",   // live/computed data flowing through the pipeline
          violet: "#4F46E5", // user-edited data -- always visually distinct from computed
        },
        ember: "#EF4444",     // deltas, drops, warnings
        paper: "#111827",     // primary text
        graphite: {
          DEFAULT: "#6B7280",
          dim: "#E5E7EB",     // borders, dividers, inactive spine segments
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 8px 20px -10px rgba(37, 99, 235, 0.45)",
        "glow-violet": "0 8px 20px -10px rgba(79, 70, 229, 0.38)",
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
