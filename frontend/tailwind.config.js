/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kitchen: {
          dark: '#0B0F17',
          panel: '#111827',
          card: '#1F2937',
          border: '#374151',
          accent: '#F59E0B',
          red: '#EF4444',
          green: '#10B981',
          blue: '#3B82F6',
          purple: '#8B5CF6'
        }
      }
    },
  },
  plugins: [],
}

