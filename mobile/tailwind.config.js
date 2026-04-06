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
          DEFAULT: "#D4A843", // Or / Gold VisiteImmobilier
          light:   "#E8C068",
          dark:    "#B8892A",
        },
        background: {
          DEFAULT: "#0A1520", // Bleu nuit profond
          light:   "#0F2236", // Navy
          lighter: "#1A3C5E", // Navy mid
        },
        surface: {
          DEFAULT: "#1A3C5E", // Card background
          light:   "#253E5A",
        },
        text: {
          primary:   "#F7F3EE", // Crème clair
          secondary: "#8DA3B5", // Bleu gris
          tertiary:  "#4A6580", // Gris foncé
        },
        accent: {
          gold:    "#D4A843",
          terra:   "#C0593D",
          green:   "#2D7D4F",
          red:     "#EF4444",
          yellow:  "#F59E0B",
        },
      },
    },
  },
  plugins: [],
};
