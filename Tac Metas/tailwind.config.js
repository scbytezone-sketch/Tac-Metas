/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#3BAE9E',
          soft: '#E9F7F4',
          accent: '#2F80ED',
          danger: '#EF4444',
        },
      },
      boxShadow: {
        card: '0 6px 24px rgba(24, 39, 75, 0.08)',
      },
      borderRadius: {
        xl: '18px',
      },
    },
  },
  plugins: [],
}
