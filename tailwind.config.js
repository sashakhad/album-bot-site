/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14110e",
        panel: "#231c16",
        cream: "#f7f1e8",
        sand: "#e4d9cc",
        muted: "#b9a892",
        line: "#4a3f36",
        amber: "#e8a15a",
        "amber-bright": "#f0b56e",
      },
      fontFamily: {
        serif: [
          "Fraunces",
          "Iowan Old Style",
          "Palatino Linotype",
          "Palatino",
          "Georgia",
          "serif",
        ],
        sans: ["Source Sans 3", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
