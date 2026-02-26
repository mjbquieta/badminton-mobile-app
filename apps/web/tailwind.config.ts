import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds - theme-aware via CSS variables (RGB channels)
        primary: "rgb(var(--bg-primary) / <alpha-value>)",
        secondary: "rgb(var(--bg-secondary) / <alpha-value>)",

        // Surface layers
        surface: {
          DEFAULT: "rgb(var(--bg-surface) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
        },

        // Dark shades for borders and chips
        dark: {
          100: "rgb(var(--border-dark-100) / <alpha-value>)",
          200: "rgb(var(--border-dark-200) / <alpha-value>)",
          300: "rgb(var(--border-dark-300) / <alpha-value>)",
        },

        // Light text shades
        light: {
          100: "rgb(var(--text-light-100) / <alpha-value>)",
          200: "rgb(var(--text-light-200) / <alpha-value>)",
          300: "rgb(var(--text-light-300) / <alpha-value>)",
        },

        // Brand colors - court inspired (same in both themes)
        court: {
          deep: "#0B5D3B",
          lime: "#84CC16",
          muted: "#65A30D",
        },

        // Accent - primary CTA
        accent: "rgb(var(--color-accent) / <alpha-value>)",

        // Semantic colors
        success: "rgb(var(--color-success) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",

        // Player levels
        beginner: "rgb(var(--color-beginner) / <alpha-value>)",
        intermediate: "rgb(var(--color-intermediate) / <alpha-value>)",
        advanced: "rgb(var(--color-advanced) / <alpha-value>)",
        pro: "rgb(var(--color-pro) / <alpha-value>)",
      },

      // Shadows for elevation
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        'glow-accent': '0 0 20px rgba(255, 212, 0, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
