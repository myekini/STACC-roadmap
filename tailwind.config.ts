import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

// Stacc palette (mirrors landing-page dark tokens in src/app/globals.css).
// Hex literals (not var()) so Tailwind 3 opacity modifiers like bg-primary/10 keep working.
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "navy": "#0a1628",
        "cyan": "#00d9ff",
        "orange": "#d9622e",
        "on-secondary": "#0a1628",
        "surface-container": "#17243a",
        "on-tertiary-fixed": "#2a1700",
        "error": "#ef4444",
        "surface-bright": "#12263f",
        "surface-tint": "#00d9ff",
        "on-primary-fixed-variant": "#003ea8",
        "on-tertiary-container": "#ffeedd",
        "error-container": "#3b1518",
        "on-surface-variant": "#8395ac",
        "secondary": "#10b981",
        "on-tertiary": "#0a1628",
        "surface-container-low": "#101b2c",
        "outline-variant": "#2a3547",
        "tertiary-fixed": "#ffddb8",
        "surface-dim": "#0a1628",
        "outline": "#526174",
        "tertiary-fixed-dim": "#ffb95f",
        "on-primary": "#ffffff",
        "on-background": "#e0e3e5",
        "secondary-fixed-dim": "#34d399",
        "on-primary-container": "#ffe3d5",
        "surface-container-lowest": "#0f1e33",
        "surface": "#12263f",
        "on-secondary-fixed-variant": "#005236",
        "background": "#0d1117",
        "on-tertiary-fixed-variant": "#653e00",
        "on-error": "#ffffff",
        "primary-container": "#8a3e1c",
        "inverse-surface": "#f7f8fc",
        "surface-container-high": "#1a2744",
        "on-error-container": "#ffb4ab",
        "surface-container-highest": "#23334f",
        "tertiary": "#f59e0b",
        "on-surface": "#e0e3e5",
        "surface-variant": "#1a2744",
        "primary-fixed": "#a5edff",
        "on-primary-fixed": "#00174b",
        "secondary-fixed": "#6ffbbe",
        "tertiary-container": "#996100",
        "primary": "#d9622e",
        "primary-neon": "#ff6b35",
        "inverse-primary": "#d9622e",
        "inverse-on-surface": "#0a1628",
        "primary-fixed-dim": "#00d9ff",
        "on-secondary-fixed": "#002113",
        "secondary-container": "#6cf8bb",
        "on-secondary-container": "#00714d"
      },
      // Modern Technical Brutalism: hard corners everywhere. `full` stays round
      // for status dots and the loading spinner only.
      borderRadius: {
        "none": "0",
        "sm": "0",
        "DEFAULT": "0",
        "md": "0",
        "lg": "0",
        "xl": "0",
        "2xl": "0",
        "3xl": "0",
        "full": "9999px"
      },
      spacing: {
        "base": "4px",
        "lg": "24px",
        "container-max": "1280px",
        "md": "16px",
        "xl": "40px",
        "xs": "4px",
        "gutter": "24px",
        "sm": "8px",
        "safe": "env(safe-area-inset-bottom)"
      },
      fontFamily: {
        "headline-lg-mobile": ["var(--font-geist-sans)", "sans-serif"],
        "code": ["var(--font-geist-mono)", "monospace"],
        "mono": ["var(--font-geist-mono)", "monospace"],
        "headline-lg": ["var(--font-geist-sans)", "sans-serif"],
        "body-lg": ["var(--font-geist-sans)", "sans-serif"],
        "body-sm": ["var(--font-geist-sans)", "sans-serif"],
        "display": ["var(--font-geist-sans)", "sans-serif"],
        "headline-md": ["var(--font-geist-sans)", "sans-serif"],
        "body-md": ["var(--font-geist-sans)", "sans-serif"],
        "label-md": ["var(--font-geist-sans)", "sans-serif"],
        "label-md-mobile": ["var(--font-geist-sans)", "sans-serif"]
      },
      fontSize: {
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "code": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "display": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "600" }],
        "label-md-mobile": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "600" }]
      }
    },
  },
  plugins: [
    forms,
  ],
};
export default config;
