/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'light-bg': '#ffffff',
        'light-accent': '#3b82f6',
        'dark-bg': '#1e3a8a',
        'dark-accent': '#60a5fa',
      },
    },
  },
  plugins: [],
}
