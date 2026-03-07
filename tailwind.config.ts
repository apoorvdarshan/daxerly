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
        background: "#0f0f0f",
        foreground: "#e5e5e5",
        accent: "#f59e0b",
        "accent-light": "#fbbf24",
        surface: "#1a1a1a",
        "surface-light": "#2a2a2a",
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
        receipt: ["'Courier New'", "Courier", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
