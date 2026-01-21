module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#00c2cc",
        "primary-dark": "#009ea6", // Derived for hover states
        "secondary-blue": "#0077B6",
        "background-light": "#f8fafb",
        "background-dark": "#0d162b",
        "sidebar-bg": "#0d162b",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
