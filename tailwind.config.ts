import type { Config } from "tailwindcss";

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
        apple: {
          bg: {
            light: "#FFF1EA",
            dark: "#1F0E1B",
          },
          surface: {
            light: "#FFFFFF",
            dark: "#33192A",
          },
          primary: {
            DEFAULT: "#E8476A",
            hover: "#C92F55",
            light: "#FF8A5B",
            subtle: "rgba(232, 71, 106, 0.14)",
          },
          text: {
            light: "#3B1425",
            dark: "#FFF4F0",
          },
          secondary: {
            light: "#8C5A68",
            dark: "#F0BCC8",
          },
        },
        spring: {
          50: "#fff9f8",
          100: "#ffefec",
          200: "#ffdcd6",
          300: "#ffbfb5",
          400: "#ff9587",
          500: "#f46352",
          600: "#df4332",
          700: "#bc3122",
          800: "#9b2b1f",
          900: "#802920",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        serif: ["Newsreader", "Tiempos Headline", "Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        "liquid-glass":
          "0 12px 32px -4px rgba(16, 21, 29, 0.08), 0 2px 6px -1px rgba(16, 21, 29, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.65)",
        "liquid-glass-dark":
          "0 16px 40px -4px rgba(0, 0, 0, 0.45), 0 4px 12px -2px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.14)",
        "stable-card":
          "0 4px 20px -2px rgba(23, 33, 43, 0.05), 0 1px 3px 0 rgba(23, 33, 43, 0.03)",
        "stable-card-dark":
          "0 6px 24px -4px rgba(0, 0, 0, 0.35), 0 1px 3px 0 rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
