// eslint.config.js
const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  unocss: true,
  formatters: {
    css: true,
    html: true,
  },
})
