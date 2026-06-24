/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/entrypoints/desktop/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        bg: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          hover: '#334155',
        },
        text: {
          DEFAULT: '#e2e8f0',
          muted: '#94a3b8',
        },
        border: '#334155',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      borderRadius: {
        xl: '12px',
      },
      boxShadow: {
        custom: '0 4px 6px -1px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};
