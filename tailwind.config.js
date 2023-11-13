/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.tsx'],
  theme: {},
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: [
      'autumn',
      'bumblebee',
      'business',
      'corporate',
      'dark',
      'dim',
      'emerald',
      'fantasy',
      'forest',
      'garden',
      'light',
      'night',
      'nord',
      'sunset',
      'winter',
    ],
  },
};
