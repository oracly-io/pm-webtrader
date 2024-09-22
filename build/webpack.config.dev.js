const { merge } = require('webpack-merge')

const base = require('./webpack.config.base.js')

module.exports = merge(base, {
  // Set the mode to development or production
  mode: 'development',

  // Control how source maps are generated
  devtool: 'inline-source-map'
})
