import nativewind from "nativewind/preset";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [nativewind],
  theme: {
    extend: {
      colors: {
        "main-bg": "#181a1b",
        "tabs-bg": "#242526",
        "tabs-border-color": "#3a3a3a",
        "text-color": "white",
        "card-bg": "#1D1E21",
        "card-border-color": "#202024",
      },
    },
  },
  plugins: [],
};
