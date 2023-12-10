// eslint.config.js
const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  unocss: true,
  formatters: true,
}, {
  rules: {
    'no-console': 'off',
  },
})
