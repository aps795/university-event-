import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        university: {
          maroon: "#781028",
          darkmaroon: "#550B1C",
          gold: "#D4AF37",
          lightgold: "#FBF6E2",
          navy: "#0C2340",
          blue: "#1E3A8A",
          slate: "#1E293B",
          cream: "#FCFBF7",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-merriweather)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
