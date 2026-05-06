/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fgc: {
          navy: '#0A1628',
          blue: '#1B3A6B',
          mid: '#2C5F9E',
          light: '#4A90D9',
          gold: '#C9A84C',
          cream: '#F5F0E8',
          bg: '#F8F9FB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
