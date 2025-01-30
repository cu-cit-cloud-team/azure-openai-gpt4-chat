const config = {
  plugins: {
    autoprefixer: {},
    '@tailwindcss/postcss': {},
    cssnano: {
      preset: 'default',
    },
    // '@fullhuman/postcss-purgecss': {
    //   content: ['./app/**/*.tsx'],
    //   fontFace: false,
    //   safelist: [/chat*/],
    // },
  },
};

export default config;
