/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        eco: {
          darkBg: '#0b0f19', // Deep space dark slate
          cardBg: 'rgba(30, 41, 59, 0.7)', // Slate 800 with glassmorphism opacity
          emerald: '#10B981', // Emerald-500
          emeraldHover: '#059669', // Emerald-600
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
