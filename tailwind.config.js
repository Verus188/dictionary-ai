const nativewind = require("nativewind/preset");

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
        "test-color": "#FFCA16",
      },
    },
  },
  plugins: [],
};
