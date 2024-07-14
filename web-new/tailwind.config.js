/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'purple': 'rgb(112, 117, 187)',
        'purple-tint-hover': 'rgba(112, 117, 187, 0.1)',
        'purple-dark-tint-hover': 'rgba(112, 117, 187, 0.2)',
        'purple-tint': 'rgb(247, 247, 251)',
        'purple-md-tint': 'rgba(97, 102, 179, 0.4)',
        'purple-deep-tint': 'rgba(97, 102, 179, 0.7)',
        'purple-deep-tint-dark': 'rgba(51, 91, 201, 0.7)'
      }
    },
  },
  plugins: [],
}

