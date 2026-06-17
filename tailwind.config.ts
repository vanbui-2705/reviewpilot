import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        editorial: ["var(--font-editorial)", "Georgia", "serif"],
      },
      colors: {
        ink: "#0f172a",
        muted: "#647084",
        line: "#e5e7eb",
        paper: "#ffffff",
        soft: "#f8f9fa",
        shopee: "#ee4d2d",
        leaf: "#15803d",
        ocean: "#2563eb",
      },
      boxShadow: {
        panel: "0 18px 48px rgba(23, 32, 51, .08)",
      },
      borderRadius: {
        ui: "8px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
