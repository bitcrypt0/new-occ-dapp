import type { Config } from "tailwindcss";

/**
 * OCCV2 design tokens — retro comic-book / zine.
 * Palette pulled directly from the OCCV2 background-color set so the
 * site is unmistakably part of the collection.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // structural neutrals
        ink: "#1A1A1A",
        paper: "#F7F1E1",
        // OCCV2 background palette
        grey: "#B5B5B5",
        sky: "#A8D5FF",
        sage: "#B8C8B0",
        rose: "#F2C4CE",
        red: "#FD5D63",
        orange: "#FCBB59",
        cream: "#FFF2CC",
        brown: "#56483C",
        lavender: "#D4C4E8",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // type scale — chunky display + readable body
        "display-xl": ["clamp(3rem, 9vw, 7rem)", { lineHeight: "0.92", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.4rem, 6vw, 4.5rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.9rem, 4vw, 3rem)", { lineHeight: "1", letterSpacing: "-0.01em" }],
        "display-sm": ["clamp(1.4rem, 2.6vw, 2rem)", { lineHeight: "1.05" }],
      },
      borderWidth: {
        ink: "3px",
        "ink-lg": "4px",
      },
      boxShadow: {
        // hard "ink" offset shadows — no blur, comic-panel style
        panel: "6px 6px 0 0 #1A1A1A",
        "panel-sm": "4px 4px 0 0 #1A1A1A",
        "panel-lg": "10px 10px 0 0 #1A1A1A",
        "panel-hover": "3px 3px 0 0 #1A1A1A",
      },
      borderRadius: {
        panel: "14px",
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "burst-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "burst-spin": "burst-spin 22s linear infinite",
        bob: "bob 3.5s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
