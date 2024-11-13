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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'poppins': ['var(--font-poppins)'],
        'tsel-batik': ['var(--font-tsel-batik)'],
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite', // Slow spin with 10 seconds per rotation
      }
    },
  },
  plugins: [],
};
export default config;
