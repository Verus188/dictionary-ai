import nativewind from "nativewind/preset";
import { colors } from "./src/shared/theme/colors";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [nativewind],
  theme: {
    extend: {
      colors,
    },
  },
  plugins: [],
};

export default module.exports;
