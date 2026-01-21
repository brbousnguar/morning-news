/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        morning: {
          light: '#FFF8E7',
          primary: '#FFB84D',
          accent: '#4A90E2',
        },
      },
    },
  },
  plugins: [],
}
