/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "flood-low": "#90EE90",
        "flood-medium": "#FFD700",
        "flood-high": "#FF6B6B",
      },
    },
  },
  plugins: [],
};
