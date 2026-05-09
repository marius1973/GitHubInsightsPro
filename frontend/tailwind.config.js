/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        github: {
          dark: "#0d1117",
          lighter: "#161b22",
          light: "#21262d",
          border: "#30363d",
          text: "#c9d1d9",
          textSecondary: "#8b949e",
        }
      }
    },
  },
  plugins: [],
}
