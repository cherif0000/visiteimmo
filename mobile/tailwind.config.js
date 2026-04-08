/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A1A2E", // Noir bleuté — couleur principale
          light:   "#2D2D4A",
          dark:    "#0D0D1A",
        },
        accent: {
          DEFAULT: "#C8922A", // Or — uniquement pour accents visuels
          light:   "#E8C068",
        },
        background: {
          DEFAULT: "#F7F7F5",
          card:    "#FFFFFF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted:   "#F0F0EC",
        },
        border: {
          DEFAULT: "#E5E5E0",
          strong:  "#D0D0CA",
        },
        text: {
          primary:   "#1A1A2E",
          secondary: "#5C6472",
          muted:     "#9AA0AA",
        },
        status: {
          success: "#16A34A",
          error:   "#DC2626",
          warning: "#D97706",
          info:    "#2563EB",
        },
      },
    },
  },
  plugins: [],
};
