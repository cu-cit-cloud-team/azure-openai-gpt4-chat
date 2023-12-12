module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-standard-scss'],
  rules: {
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
    'no-descending-specificity': null,
    'no-empty-source': null,
    'at-rule-no-unknown': null,
  },
};
