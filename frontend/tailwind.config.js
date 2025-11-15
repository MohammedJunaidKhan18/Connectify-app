import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],

  daisyui: {
    themes: [
      "light",
      "dark",
      "forest",
      "emerald",
      "corporate",
      "synthwave",
      "valentine",
      "halloween",
      "garden",
      "lofi",
      "black",
      "luxury",
      "business",
      "night",
      "coffee",
      "winter",
      "sunset",
      "autumn",
    ],
  },
};

