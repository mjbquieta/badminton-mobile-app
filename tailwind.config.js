/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // "Potato" theme: warm soil browns, creamy highlights, golden accents.
        primary: "#2B1B12", // deep soil (main background)
        secondary: "#3C2A1E", // potato sack (secondary surfaces)
        light: {
          100: "#FFF7ED", // warm cream (high contrast text)
          200: "#E7D9C2", // muted cream (secondary text)
          300: "#C4B39C", // dusty tan (placeholders / subtle UI)
        },
        dark: {
          100: "#4A3425", // warm brown (borders / chips)
          200: "#3C2A1E", // warm brown (cards / surfaces)
        },
        accent: "#D8A34A", // golden potato skin highlight
        success: "#7AD957", // sprout green (brighter for visibility)
        danger: "#FF5A3D", // brighter red for visibility
      },
    },
  },
  plugins: [],
};
