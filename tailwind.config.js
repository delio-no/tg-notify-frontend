/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--tg-theme-button-color, #3390ec)',
        'primary-text': 'var(--tg-theme-button-text-color, #ffffff)',
        background: 'var(--tg-theme-bg-color, #ffffff)',
        'secondary-bg': 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
        text: 'var(--tg-theme-text-color, #000000)',
        'hint-color': 'var(--tg-theme-hint-color, #999999)',
      }
    },
  },
  plugins: [],
}
