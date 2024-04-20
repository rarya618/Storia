/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'purple': 'rgba(97, 102, 179, 0.9)',
        'purple-dark': 'rgba(127, 152, 220, 0.9)',
        'purple-tint': 'rgba(97, 102, 179, 0.1)',
        'purple-deep-tint': 'rgba(97, 102, 179, 0.7)',
        'purple-deep-tint-dark': 'rgba(51, 91, 201, 0.7)'
      }
    },
  },
  plugins: [],
}

