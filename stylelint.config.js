module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'plugin',
          'theme',
          'utility',
          'source',
          'custom-variant',
        ],
      },
    ],
    'no-descending-specificity': null,
    'no-empty-source': null,
  },
};
