/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Backgrounds - dark mode optimized
        primary: "#0A0A0A",    // Deep black (screen background)
        secondary: "#141414",  // Surface (cards, modals)
        
        // Surface layers
        surface: {
          DEFAULT: "#141414",
          elevated: "#1E1E1E",
        },
        
        // Dark shades for borders and chips
        dark: {
          100: "#2A2A2A",  // Borders
          200: "#1E1E1E",  // Elevated surfaces
          300: "#141414",  // Cards
        },
        
        // Light text shades
        light: {
          100: "#FFFFFF",  // Primary text
          200: "#A3A3A3",  // Secondary text
          300: "#666666",  // Muted/placeholder
        },
        
        // Brand colors - court inspired
        court: {
          deep: "#0B5D3B",    // Deep green
          lime: "#84CC16",    // Vibrant lime
          muted: "#65A30D",   // Muted lime
        },
        
        // Accent - primary CTA
        accent: "#FFD400",
        
        // Semantic colors
        success: "#22C55E",
        danger: "#EF4444",
        info: "#3B82F6",
        warning: "#F97316",
        
        // Player levels
        beginner: "#22C55E",
        intermediate: "#3B82F6",
        advanced: "#A855F7",
        pro: "#FFD400",
      },
      
      // Shadows for elevation
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'glow-accent': '0 0 20px rgba(255, 212, 0, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
      },
    },
  },
  plugins: [],
};
