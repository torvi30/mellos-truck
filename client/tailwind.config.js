/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        carbon: {
          950: "#07080b",
          900: "#0c0e14",
          850: "#12151e",
          800: "#181d28",
          750: "#1e2432",
          700: "#242c3d",
          600: "#343e54",
        },
        truck: {
          amber: "#f59e0b",
          "amber-light": "#fbbf24",
          "amber-dark": "#d97706",
          orange: "#f97316",
          red: "#ef4444",
          blue: "#0284c7",
          green: "#10b981",
        },
        chrome: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "glow-amber": "0 0 25px -5px rgba(245, 158, 11, 0.45)",
        "glow-orange": "0 0 25px -5px rgba(249, 115, 22, 0.45)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.45)",
        "card-dark": "0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
