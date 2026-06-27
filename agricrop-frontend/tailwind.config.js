import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32',
        secondary: '#4CAF50',
        accent: '#A5D6A7',
        earth: '#6D4C41',
        'leaf-bg': '#F1F8E9',
        'dark-green': '#1B2E1B',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
