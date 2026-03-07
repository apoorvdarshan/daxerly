import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08080a",
        foreground: "#d4d4d8",
        accent: "#e5a411",
        "accent-light": "#f5bf36",
        "accent-dim": "#b8860b",
        surface: "#111113",
        "surface-light": "#1c1c1f",
        "surface-border": "#27272a",
        paper: "#f5f0e8",
        "paper-dark": "#e8e0d0",
        ink: "#1a1812",
        "ink-light": "#4a4639",
        "ink-faded": "#8a8475",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        receipt: ["var(--font-ibm-plex-mono)", "monospace"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      animation: {
        "receipt-print": "receiptPrint 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "scan-line": "scanLine 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        receiptPrint: {
          "0%": { transform: "translateY(-20px)", opacity: "0", clipPath: "inset(0 0 100% 0)" },
          "100%": { transform: "translateY(0)", opacity: "1", clipPath: "inset(0 0 0 0)" },
        },
        fadeUp: {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.15)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(1.5deg)" },
          "50%": { transform: "translateY(-8px) rotate(0.5deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
