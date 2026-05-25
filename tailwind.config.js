/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
      },
      colors: {
        primary: "var(--color-dark-base)",
      },
    },
  },
  plugins: [],
};
